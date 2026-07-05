CREATE TABLE food_dictionary
(
    id                BIGSERIAL PRIMARY KEY,
    name              VARCHAR(255) NOT NULL,
    brand             VARCHAR(255),
    calories_per_100g INT          NOT NULL,
    protein_per_100g  REAL         NOT NULL,
    carbs_per_100g    REAL         NOT NULL,
    fat_per_100g      REAL         NOT NULL,
    created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_food_dictionary_name ON food_dictionary (name);

CREATE TABLE meals
(
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name       VARCHAR(255) NOT NULL,
    logged_at  TIMESTAMP    NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_meals_user_id_logged_at ON meals (user_id, logged_at);

CREATE TABLE meal_items
(
    id       BIGSERIAL PRIMARY KEY,
    meal_id  BIGINT NOT NULL REFERENCES meals (id) ON DELETE CASCADE,
    food_id  BIGINT NOT NULL REFERENCES food_dictionary (id),
    weight_g REAL   NOT NULL
);
