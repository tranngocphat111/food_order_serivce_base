-- ============================================================
--  Token Blacklist Table untuk User Service (port 8081)
--  Lưu các token đã logout
-- ============================================================

CREATE TABLE IF NOT EXISTS token_blacklist (
    id          BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
    token       LONGTEXT     NOT NULL UNIQUE,
    user_id     BIGINT       NOT NULL,
    blacklisted_at DATETIME   NOT NULL,
    expires_at  DATETIME     NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_token_blacklist_user_id ON token_blacklist(user_id);
CREATE INDEX idx_token_blacklist_expires_at ON token_blacklist(expires_at);
