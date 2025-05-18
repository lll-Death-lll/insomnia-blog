FROM rust:latest AS builder

WORKDIR /usr/src/app

COPY . .

RUN cargo build --release

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y curl --no-install-recommends && rm -rf /var/lib/apt/lists/*

COPY --from=builder /usr/src/app/target/release/insomnia-blog-api /usr/local/bin/

EXPOSE 3000

CMD ["insomnia-blog-api"]
