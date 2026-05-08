BEGIN;

create table users (
    id serial primary key,
    user_name text not null unique,
    password text not null
);

create extension if not exists pgcrypto;

COMMIT;