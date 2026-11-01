-- Portfolio schema. Safe to run more than once.

CREATE TABLE IF NOT EXISTS profile (
  id            INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  full_name     TEXT NOT NULL DEFAULT '',
  headline      TEXT NOT NULL DEFAULT '',
  tagline       TEXT NOT NULL DEFAULT '',
  bio           TEXT NOT NULL DEFAULT '',
  location      TEXT NOT NULL DEFAULT '',
  availability  TEXT NOT NULL DEFAULT '',
  email         TEXT NOT NULL DEFAULT '',
  phone         TEXT NOT NULL DEFAULT '',
  linkedin_url  TEXT NOT NULL DEFAULT '',
  github_url    TEXT NOT NULL DEFAULT '',
  website_url   TEXT NOT NULL DEFAULT '',
  photo_url     TEXT NOT NULL DEFAULT '',
  resume_url    TEXT NOT NULL DEFAULT '',
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS experiences (
  id               SERIAL PRIMARY KEY,
  role             TEXT NOT NULL,
  company          TEXT NOT NULL DEFAULT '',
  location         TEXT NOT NULL DEFAULT '',
  employment_type  TEXT NOT NULL DEFAULT '',
  start_date       TEXT NOT NULL DEFAULT '',
  end_date         TEXT NOT NULL DEFAULT '',
  description      TEXT NOT NULL DEFAULT '',
  tech             TEXT NOT NULL DEFAULT '',
  logo_url         TEXT NOT NULL DEFAULT '',
  sort_order       INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id           SERIAL PRIMARY KEY,
  title        TEXT NOT NULL,
  summary      TEXT NOT NULL DEFAULT '',
  description  TEXT NOT NULL DEFAULT '',
  role         TEXT NOT NULL DEFAULT '',
  tech         TEXT NOT NULL DEFAULT '',
  start_date   TEXT NOT NULL DEFAULT '',
  end_date     TEXT NOT NULL DEFAULT '',
  image_url    TEXT NOT NULL DEFAULT '',
  live_url     TEXT NOT NULL DEFAULT '',
  repo_url     TEXT NOT NULL DEFAULT '',
  featured     BOOLEAN NOT NULL DEFAULT false,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS education (
  id          SERIAL PRIMARY KEY,
  school      TEXT NOT NULL,
  degree      TEXT NOT NULL DEFAULT '',
  location    TEXT NOT NULL DEFAULT '',
  start_date  TEXT NOT NULL DEFAULT '',
  end_date    TEXT NOT NULL DEFAULT '',
  gpa         TEXT NOT NULL DEFAULT '',
  details     TEXT NOT NULL DEFAULT '',
  logo_url    TEXT NOT NULL DEFAULT '',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS skills (
  id          SERIAL PRIMARY KEY,
  category    TEXT NOT NULL DEFAULT 'General',
  name        TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS languages (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  proficiency  TEXT NOT NULL DEFAULT '',
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS certifications (
  id              SERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  issuer          TEXT NOT NULL DEFAULT '',
  issued_date     TEXT NOT NULL DEFAULT '',
  credential_url  TEXT NOT NULL DEFAULT '',
  image_url       TEXT NOT NULL DEFAULT '',
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS awards (
  id           SERIAL PRIMARY KEY,
  title        TEXT NOT NULL,
  issuer       TEXT NOT NULL DEFAULT '',
  year         TEXT NOT NULL DEFAULT '',
  description  TEXT NOT NULL DEFAULT '',
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leadership (
  id            SERIAL PRIMARY KEY,
  role          TEXT NOT NULL,
  organization  TEXT NOT NULL DEFAULT '',
  start_date    TEXT NOT NULL DEFAULT '',
  end_date      TEXT NOT NULL DEFAULT '',
  description   TEXT NOT NULL DEFAULT '',
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO profile (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
