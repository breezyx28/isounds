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

CREATE TABLE IF NOT EXISTS category_affinities (
  msisdn        TEXT    NOT NULL,
  category_id   INTEGER NOT NULL,
  score         REAL    NOT NULL DEFAULT 0,
  signals_json  TEXT,
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  PRIMARY KEY (msisdn, category_id)
);

CREATE TABLE IF NOT EXISTS category_settings (
  msisdn         TEXT    NOT NULL,
  category_id    INTEGER NOT NULL,
  pinned         INTEGER NOT NULL DEFAULT 0,
  hidden         INTEGER NOT NULL DEFAULT 0,
  push_enabled   INTEGER NOT NULL DEFAULT 1,
  updated_at     INTEGER NOT NULL DEFAULT (unixepoch()),
  PRIMARY KEY (msisdn, category_id)
);

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  msisdn        TEXT    NOT NULL,
  endpoint      TEXT    NOT NULL UNIQUE,
  p256dh        TEXT    NOT NULL,
  auth          TEXT    NOT NULL,
  user_agent    TEXT,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  last_used_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS notified_episodes (
  podcast_id    INTEGER PRIMARY KEY,
  category_id   INTEGER NOT NULL,
  notified_at   INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS poll_state (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  updated_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS podcast_cache (
  id            INTEGER PRIMARY KEY,
  category_id   INTEGER,
  name          TEXT,
  image         TEXT,
  created_at    TEXT,
  cached_at     INTEGER NOT NULL DEFAULT (unixepoch())
);
`;

function columnExists(db: Database, table: string, column: string): boolean {
  const rows = db.query(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>;
  return rows.some((row) => row.name === column);
}

function tableExists(db: Database, table: string): boolean {
  const row = db
    .query("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
    .get(table) as { name?: string } | null;
  return Boolean(row?.name);
}

function addColumnIfMissing(db: Database, table: string, column: string, definition: string) {
  if (!columnExists(db, table, column)) {
    db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

function migrateUserPreferencesToMsisdn(db: Database) {
  if (!tableExists(db, "user_preferences")) return;
  if (columnExists(db, "user_preferences", "msisdn")) return;

  db.run(`
    CREATE TABLE IF NOT EXISTS user_preferences_scoped (
      msisdn      TEXT NOT NULL DEFAULT '',
      key         TEXT NOT NULL,
      value       TEXT NOT NULL,
      updated_at  INTEGER NOT NULL DEFAULT (unixepoch()),
      PRIMARY KEY (msisdn, key)
    )
  `);

  const rows = db.query("SELECT key, value, updated_at FROM user_preferences").all() as Array<{
    key: string;
    value: string;
    updated_at: number;
  }>;

  const insert = db.query(
    "INSERT OR REPLACE INTO user_preferences_scoped (msisdn, key, value, updated_at) VALUES (?, ?, ?, ?)",
  );
  for (const row of rows) {
    insert.run("", row.key, row.value, row.updated_at);
  }

  db.run("DROP TABLE user_preferences");
  db.run("ALTER TABLE user_preferences_scoped RENAME TO user_preferences");
}

function migrateLegacySchema(db: Database) {
  addColumnIfMissing(db, "search_history", "msisdn", "TEXT");
  addColumnIfMissing(db, "ratings", "msisdn", "TEXT");
  addColumnIfMissing(db, "complaints", "msisdn", "TEXT");
  addColumnIfMissing(db, "complaints", "name", "TEXT");
  addColumnIfMissing(db, "listening_history", "msisdn", "TEXT");
  addColumnIfMissing(db, "visits", "category_id", "INTEGER");
  addColumnIfMissing(db, "visits", "podcast_id", "INTEGER");
  addColumnIfMissing(db, "visits", "event_type", "TEXT");

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
  db.run(`CREATE INDEX IF NOT EXISTS idx_affinities_msisdn ON category_affinities(msisdn)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_push_msisdn ON push_subscriptions(msisdn)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_category_settings_msisdn ON category_settings(msisdn)`);
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_visits_msisdn_created ON visits(msisdn, created_at)`,
  );
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_bookmarks_msisdn_created ON bookmarks(msisdn, created_at)`,
  );
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_listening_msisdn_updated ON listening_history(msisdn, updated_at)`,
  );
  addColumnIfMissing(db, "listening_history", "session_id", "TEXT");
  db.run(
    `CREATE INDEX IF NOT EXISTS idx_listening_session_podcast
     ON listening_history(session_id, podcast_id) WHERE msisdn IS NULL`,
  );

  migrateUserPreferencesToMsisdn(db);
}

export function runMigrations(db: Database) {
  db.run(BASE_SCHEMA);
  migrateLegacySchema(db);
}
