use std::collections::HashMap;
use tiny_http::{Response, Header};
use std::io::Cursor;
use url::Url;

pub fn create_bad_request_response() -> Response<Cursor<Vec<u8>>> {
    json_response("{\"error\": \"Bad Request\"}", 400)
}

pub fn create_not_found_response() -> Response<Cursor<Vec<u8>>> {
    json_response("{\"error\": \"Not Found\"}", 404)
}

pub fn create_json_response(content: String) -> Response<Cursor<Vec<u8>>> {
    json_response(&content, 200)
}

fn json_response(content: &str, status: u16) -> Response<Cursor<Vec<u8>>> {
    Response::from_string(content)
        .with_status_code(status)
        .with_header(Header::from_bytes("Content-Type", "application/json").unwrap())
}

pub fn parse_query_params(url: &str) -> String {
    Url::parse(&format!("http://localhost{}", url))
        .map(|u| u.query_pairs().into_owned().collect::<HashMap<_, _>>())
        .map(|q| serde_json::to_string(&q).unwrap_or("{}".to_string()))
        .unwrap_or("{}".to_string())
}
