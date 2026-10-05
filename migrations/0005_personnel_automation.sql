-- ROGIS Dienstplan v6.3 – automatische Ausbildung / Personalentwicklung
CREATE TABLE IF NOT EXISTS employee_training (
  employee_id TEXT PRIMARY KEY,
  cohort_year INTEGER NOT NULL,
  program TEXT NOT NULL DEFAULT 'Fachkraft im Fahrbetrieb',
  auto_created INTEGER NOT NULL DEFAULT 1,
  graduated_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS automation_state (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_employee_training_cohort ON employee_training(cohort_year);
