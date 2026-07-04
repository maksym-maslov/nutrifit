CREATE TABLE users
(
    id         BIGSERIAL PRIMARY KEY,
    email      VARCHAR(255) UNIQUE NOT NULL,
    password   VARCHAR(255)        NOT NULL,
    full_name  VARCHAR(255)        NOT NULL,
    role       VARCHAR(50)         NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE refresh_tokens
(
    id          BIGSERIAL PRIMARY KEY,
    token       VARCHAR(512) UNIQUE NOT NULL,
    user_id     BIGINT              NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    expiry_date TIMESTAMP           NOT NULL
);
