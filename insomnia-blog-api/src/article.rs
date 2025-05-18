use axum::{
    Json,
    extract::{Path, Query, State},
};
use rand::{Rng, distr::Alphanumeric};
use serde::{Deserialize, Serialize, Serializer};
use sqlx::{PgPool, prelude::FromRow, query, query_as};
use time::{OffsetDateTime, format_description::well_known::Rfc3339};
use tracing::{error, instrument};

use crate::error::{APIError, Result};

#[derive(Deserialize, Debug)]
pub struct PaginationParams {
    offset: Option<i32>,
    limit: Option<i32>,
}

#[derive(Serialize, FromRow)]
pub struct Article {
    title: String,
    author: String,
    article_url: String,
    image_url: String,
    #[serde(serialize_with = "time_to_string")]
    created_at: OffsetDateTime,
}

pub fn time_to_string<S>(
    time: &OffsetDateTime,
    serializer: S,
) -> std::result::Result<S::Ok, S::Error>
where
    S: Serializer,
{
    serializer.serialize_str(&time.format(&Rfc3339).unwrap())
}

#[instrument]
pub async fn get_articles(
    State(pool): State<PgPool>,
    Query(pagination): Query<PaginationParams>,
) -> Result<Json<Vec<Article>>> {
    let articles: Vec<Article> = query_as(
        "
    SELECT
        a.title,
        u.name AS author,
        a.article_url,
        a.image_url,
        a.created_at
    FROM
        articles a
    JOIN
        users u ON a.user_id = u.id
    LIMIT $1
    OFFSET $2
    ",
    )
    .bind(pagination.limit.unwrap_or(1))
    .bind(pagination.offset.unwrap_or(0))
    .fetch_all(&pool)
    .await
    .inspect_err(|e| error!("{}", e.to_string()))
    .map_err(|_| APIError::ServerError)?;

    Ok(Json(articles))
}

#[derive(Serialize, FromRow)]
pub struct FullArticle {
    title: String,
    content: String,
    author_name: String,
    author_email: String,
    article_url: String,
    image_url: String,
    author_link: String,
    #[serde(serialize_with = "time_to_string")]
    created_at: OffsetDateTime,
}

#[instrument]
pub async fn get_article(
    State(pool): State<PgPool>,
    Path(url): Path<String>,
) -> Result<Json<FullArticle>> {
    let article = query_as::<_, FullArticle>(
        "
    SELECT
        a.title,
        a.content,
        u.name AS author_name,
        u.email AS author_email,
        a.article_url,
        a.image_url,
        u.link AS author_link,
        a.created_at
    FROM
        articles a
    JOIN
        users u ON a.user_id = u.id
    WHERE a.article_url = $1
    ",
    )
    .bind(&url)
    .fetch_optional(&pool)
    .await
    .inspect_err(|e| error!("{}", e.to_string()))
    .map_err(|_| APIError::ServerError)?;

    Ok(Json(article.ok_or(APIError::ArticleNotFound(url))?))
}

#[derive(Deserialize, Debug)]
pub struct UploadArticleParams {
    title: String,
    content: String,
    article_url: Option<String>,
    image_url: Option<String>,
    username: String,
    password: UserPassword,
}

#[derive(Deserialize)]
pub struct UserPassword(String);

impl std::fmt::Debug for UserPassword {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "password")
    }
}

#[derive(FromRow)]
pub struct UserLoginData {
    user_id: i32,
    password_hash: String,
}

#[instrument]
pub async fn upload_article(
    State(pool): State<PgPool>,
    Json(new_article): Json<UploadArticleParams>,
) -> Result<String> {
    if new_article.title.is_empty() {
        return Err(APIError::EmptyField("title".into()));
    }
    if new_article.content.is_empty() {
        return Err(APIError::EmptyField("content".into()));
    }
    if new_article.username.is_empty() || new_article.password.0.is_empty() {
        return Err(APIError::Unauthorized);
    }

    let UploadArticleParams {
        title,
        content,
        article_url,
        image_url,
        username,
        password,
    } = new_article;

    let image_url = match image_url {
        Some(v) if !v.is_empty() => v,
        _ => return Err(APIError::EmptyField("image_url".into())),
    };

    let article_url = match article_url {
        Some(v) if !v.is_empty() => v,
        _ => rand::rng()
            .sample_iter(&Alphanumeric)
            .take(16)
            .map(char::from)
            .collect(),
    };

    let user_data = query_as::<_, UserLoginData>(
        "SELECT id as user_id, password_hash FROM users WHERE username = $1 AND is_disabled=false LIMIT 1",
    )
    .bind(&username)
    .fetch_optional(&pool)
    .await
    .inspect_err(|e| error!("{}", e.to_string()))
    .map_err(|_| APIError::ServerError)?;

    if let None = user_data {
        return Err(APIError::Unauthorized);
    }

    let UserLoginData {
        user_id,
        password_hash,
    } = user_data.ok_or(APIError::Unauthorized)?;

    let password = &password.0;

    match bcrypt::verify(password, &password_hash) {
        Ok(correct) if correct == true => {
            let response = query("INSERT INTO articles (title, content, article_url, image_url, user_id) VALUES ($1, $2, $3, $4, $5)")
                .bind(&title)
                .bind(&content)
                .bind(&article_url)
                .bind(&image_url)
                .bind(&user_id)
                .execute(&pool)
                .await;

            match response {
                Ok(_) => Ok(article_url),
                Err(sqlx::Error::Database(e)) if e.is_unique_violation() => {
                    Err(APIError::DuplicateArticleUrl)
                }
                Err(_) => Err(APIError::ServerError),
            }
        }
        Ok(correct) if correct == false => Err(APIError::Unauthorized),
        Ok(_) => Err(APIError::ServerError),
        Err(_) => Err(APIError::ServerError),
    }
}
