#!/bin/sh
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<EOSQL
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
    id serial primary key,
    user_name text not null unique,
    password text not null
);

INSERT INTO users (user_name, password)
VALUES ('${SEED_ADMIN_USERNAME}', crypt('${SEED_ADMIN_PASSWORD}', gen_salt('bf')))
ON CONFLICT (user_name) DO NOTHING;

INSERT INTO users (user_name, password)
VALUES ('${SEED_USER_USERNAME}', crypt('${SEED_USER_PASSWORD}', gen_salt('bf')))
ON CONFLICT (user_name) DO NOTHING;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE users TO ${APP_DB_USER};
GRANT USAGE, SELECT ON SEQUENCE users_id_seq TO ${APP_DB_USER};
EOSQL