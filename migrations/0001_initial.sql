-- ROGIS Dienstplan – D1 Schema
-- Der Worker legt diese Tabellen beim ersten API-Aufruf ebenfalls automatisch an.

CREATE TABLE IF NOT EXISTS users (
  username TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL,
  role TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  must_change INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS week_plans (
  monday TEXT PRIMARY KEY,
  version INTEGER NOT NULL,
  plan_json TEXT NOT NULL,
  generated_at TEXT NOT NULL,
  generated_by TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS objections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  requested_date TEXT NOT NULL,
  type TEXT NOT NULL,
  requested_time TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'offen',
  admin_note TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);


CREATE TABLE IF NOT EXISTS duty_overrides (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id TEXT NOT NULL,
  duty_date TEXT NOT NULL,
  kind TEXT NOT NULL,
  duty_type TEXT,
  depot TEXT,
  start_time TEXT,
  end_time TEXT,
  note TEXT,
  created_by TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(employee_id, duty_date)
);

CREATE TABLE IF NOT EXISTS generation_settings (
  id INTEGER PRIMARY KEY CHECK(id = 1),
  settings_json TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
