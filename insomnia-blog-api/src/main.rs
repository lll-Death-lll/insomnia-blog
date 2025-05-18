use std::env;

use axum::{
    Router,
    http::{StatusCode, Uri},
    routing::{get, post},
};
use sqlx::PgPool;
use tracing::info;
use user::configure_users;
pub mod article;
pub mod error;
mod user;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::ERROR)
        .init();

    let url = match (
        env::var("POSTGRES_USER"),
        env::var("POSTGRES_PASSWORD"),
        env::var("POSTGRES_HOST"),
        env::var("POSTGRES_PORT"),
        env::var("POSTGRES_DB"),
    ) {
        (Ok(user), Ok(password), Ok(host), Ok(port), Ok(db)) => {
            format!("postgresql://{user}:{password}@{host}:{port}/{db}")
        }
        _ => panic!("DB connection parameters not found"),
    };

    let pool = PgPool::connect(&url)
        .await
        .expect(format!("Failed to connect with {url}").as_str());

    sqlx::migrate!("./migrations/").run(&pool).await.unwrap();
    configure_users(&pool).await.unwrap();

    let address = env::var("SERVER_ADDRESS").unwrap_or("0.0.0.0:3000".to_string());

    let app = Router::new()
        .route("/health", get(StatusCode::OK))
        .nest(
            "/api",
            Router::new()
                .route("/article", get(article::get_articles))
                .route("/article/{id}", get(article::get_article))
                .route("/article", post(article::upload_article))
                .with_state(pool),
        )
        .fallback(fallback);

    let listener = tokio::net::TcpListener::bind(address).await.unwrap();

    info!("Listening at {:?}", listener.local_addr());

    axum::serve(listener, app).await.unwrap();
}

async fn fallback(uri: Uri) -> (StatusCode, String) {
    (StatusCode::NOT_FOUND, format!("No route for {uri}"))
}
