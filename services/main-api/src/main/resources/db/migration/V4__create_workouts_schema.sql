ALTER TABLE users
    ADD COLUMN weight_kg    REAL DEFAULT 70.0,
    ADD COLUMN goal_calories INT  DEFAULT 2000,
    ADD COLUMN goal_protein_g REAL DEFAULT 150.0,
    ADD COLUMN goal_carbs_g REAL  DEFAULT 250.0,
    ADD COLUMN goal_fat_g   REAL  DEFAULT 65.0;

CREATE TABLE exercise_dictionary
(
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(255) UNIQUE NOT NULL,
    met_value  REAL                NOT NULL,
    category   VARCHAR(100)        NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exercise_dictionary_name ON exercise_dictionary (name);

CREATE TABLE workout_logs
(
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT    NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    exercise_id      BIGINT    NOT NULL REFERENCES exercise_dictionary (id),
    duration_minutes INT       NOT NULL,
    calories_burned  INT       NOT NULL,
    logged_at        TIMESTAMP NOT NULL,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workout_logs_user_id_logged_at ON workout_logs (user_id, logged_at);

INSERT INTO exercise_dictionary (name, met_value, category)
VALUES ('Running (8 km/h)', 8.3, 'Cardio'),
       ('Running (12 km/h)', 11.5, 'Cardio'),
       ('Cycling (moderate)', 8.0, 'Cardio'),
       ('Cycling (vigorous)', 12.0, 'Cardio'),
       ('Swimming (moderate)', 6.0, 'Cardio'),
       ('Swimming (vigorous)', 10.0, 'Cardio'),
       ('Walking (5 km/h)', 3.5, 'Cardio'),
       ('Jump Rope', 12.3, 'Cardio'),
       ('Weight Training (general)', 5.0, 'Strength'),
       ('Weight Training (vigorous)', 6.0, 'Strength'),
       ('HIIT', 8.0, 'Cardio'),
       ('Yoga', 2.5, 'Flexibility'),
       ('Pilates', 3.0, 'Flexibility'),
       ('Rowing (moderate)', 7.0, 'Cardio'),
       ('Elliptical (moderate)', 5.0, 'Cardio');
