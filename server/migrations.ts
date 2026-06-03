import type { Database } from "bun:sqlite";

const BASE_SCHEMA = `
CREATE TABLE IF NOT EXISTS search_history (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  query       TEXT    NOT NULL,
  msisdn      TEXT,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS ratings (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  podcast_id  INTEGER NOT NULL,
  rating      INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  session_id  TEXT,
  msisdn      TEXT,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS complaints (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  podcast_id  INTEGER,
  type        TEXT    NOT NULL,
  description TEXT    NOT NULL,
  phone       TEXT,
  msisdn      TEXT,
  name        TEXT,
  status      TEXT    NOT NULL DEFAULT 'new',
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS listening_history (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  podcast_id        INTEGER NOT NULL,
  msisdn            TEXT,
  position_seconds  REAL    NOT NULL DEFAULT 0,
  duration_seconds  REAL    NOT NULL DEFAULT 0,
  updated_at        INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS user_preferences (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  updated_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS pwa_events (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  event       TEXT    NOT NULL,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS users (
  msisdn          TEXT PRIMARY KEY,
  first_seen_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  last_seen_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  is_subscribed   INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sessions (
  id              TEXT PRIMARY KEY,
  msisdn          TEXT NOT NULL,
  started_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  last_active_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  user_agent      TEXT,
  referrer        TEXT
);

CREATE TABLE IF NOT EXISTS visits (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id  TEXT NOT NULL,
  msisdn      TEXT,
  path        TEXT NOT NULL,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  msisdn      TEXT NOT NULL,
  podcast_id  INTEGER NOT NULL,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(msisdn, podcast_id)
);
`;

function columnExists(db: Database, table: string, column: string): boolean {
  const rows = db.query(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  return rows.some((row) => row.name === column);
}

function addColumnIfMissing(db: Database, table: string, column: string, definition: string) {
  if (!columnExists(db, table, column)) {
    db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

function migrateLegacySchema(db: Database) {
  addColumnIfMissing(db, "search_history", "msisdn", "TEXT");
  addColumnIfMissing(db, "ratings", "msisdn", "TEXT");
  addColumnIfMissing(db, "complaints", "msisdn", "TEXT");
  addColumnIfMissing(db, "complaints", "name", "TEXT");
  addColumnIfMissing(db, "listening_history", "msisdn", "TEXT");

  db.run(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_ratings_podcast_msisdn
     ON ratings(podcast_id, msisdn) WHERE msisdn IS NOT NULL`,
  );
  db.run(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_listening_msisdn_podcast
     ON listening_history(msisdn, podcast_id) WHERE msisdn IS NOT NULL`,
  );
  db.run(`CREATE INDEX IF NOT EXISTS idx_visits_msisdn ON visits(msisdn)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_bookmarks_msisdn ON bookmarks(msisdn)`);
}

export function runMigrations(db: Database) {
  db.run(BASE_SCHEMA);
  migrateLegacySchema(db);
}
