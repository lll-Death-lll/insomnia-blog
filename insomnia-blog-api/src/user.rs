use std::env;

use serde::Deserialize;
use sqlx::{PgPool, Postgres, QueryBuilder};

#[derive(Deserialize)]
pub struct User {
    username: String,
    password: String,
    name: String,
    email: String,
    link: String,
}

pub async fn configure_users(pool: &PgPool) -> anyhow::Result<()> {
    let Ok(users_json) = env::var("USERS") else {
        return Ok(());
    };

    let users: Vec<User> = serde_json::from_str(&users_json)?;

    add_new_users(pool, &users).await?;
    disable_unused_users(pool, &users).await?;

    Ok(())
}

async fn add_new_users(pool: &PgPool, users: &Vec<User>) -> anyhow::Result<()> {
    let mut builder: QueryBuilder<Postgres> = QueryBuilder::new(
        "
    INSERT INTO users
    (username, password_hash, name, email, link) ",
    );

    builder.push_values(users, |mut b, user| {
        b.push_bind(&user.username)
            .push_bind(bcrypt::hash(&user.password, 10).unwrap())
            .push_bind(&user.name)
            .push_bind(&user.email)
            .push_bind(&user.link);
    });

    builder.push(
        "ON CONFLICT (username)
    DO UPDATE SET
      password_hash = EXCLUDED.password_hash,
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      link = EXCLUDED.link,
      is_disabled = false;",
    );

    builder.build().execute(pool).await?;

    Ok(())
}

async fn disable_unused_users(pool: &PgPool, users: &Vec<User>) -> anyhow::Result<()> {
    let mut builder = QueryBuilder::<Postgres>::new(
        "UPDATE users SET is_disabled = true WHERE username NOT IN (",
    );

    let mut separated = builder.separated(", ");

    for user in users {
        separated.push_bind(&user.username);
    }

    builder.push(")");

    builder.build().execute(pool).await?;

    Ok(())
}
