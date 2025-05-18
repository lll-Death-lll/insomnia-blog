-- Add users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    email TEXT NOT NULL,
    link TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW (),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- Add articles table
CREATE TABLE articles (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    article_url TEXT NOT NULL UNIQUE,
    image_url TEXT NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW (),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW (),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);
