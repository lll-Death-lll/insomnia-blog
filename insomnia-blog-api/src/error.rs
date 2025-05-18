use axum::{
    body::Body,
    http::StatusCode,
    response::{self, IntoResponse, Response},
};
use serde::Serialize;
use thiserror::Error;

#[derive(Error, Debug, Serialize, Clone)]
pub enum APIError {
    #[error("Field {0} should not be empty")]
    EmptyField(String),
    #[error("Unauthorized")]
    Unauthorized,
    #[error("Article with the same url already exists")]
    DuplicateArticleUrl,
    #[error("Article with id {0} not found")]
    ArticleNotFound(String),
    #[error("Unknown error")]
    ServerError,
}

pub type Result<T> = std::result::Result<T, APIError>;

impl IntoResponse for APIError {
    fn into_response(self) -> axum::response::Response {
        let status = match self {
            APIError::ServerError => StatusCode::INTERNAL_SERVER_ERROR,
            APIError::ArticleNotFound(_) => StatusCode::NOT_FOUND,
            APIError::Unauthorized => StatusCode::UNAUTHORIZED,
            APIError::DuplicateArticleUrl => StatusCode::BAD_REQUEST,
            APIError::EmptyField(_) => StatusCode::BAD_REQUEST,
        };

        match response::Response::builder()
            .status(status)
            .body(Body::new(self.to_string()))
        {
            Ok(response) => response,
            Err(_) => Response::default(),
        }
    }
}
