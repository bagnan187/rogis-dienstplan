-- ROGIS Dienstplan v6.0 – Personalbewegungen / Neueinstellungen / Austritte
CREATE TABLE IF NOT EXISTS employee_records (
  employee_id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  business_area TEXT NOT NULL,
  location TEXT NOT NULL,
  employment TEXT NOT NULL,
  hours REAL NOT NULL DEFAULT 39,
  birth_date TEXT,
  start_date TEXT NOT NULL,
  created_at TEXT NOT NULL,
  created_by TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS employee_lifecycle (
  employee_id TEXT PRIMARY KEY,
  birth_date TEXT,
  start_date TEXT,
  end_date TEXT,
  end_reason TEXT,
  updated_at TEXT NOT NULL,
  updated_by TEXT NOT NULL
);
