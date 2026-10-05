CREATE TABLE IF NOT EXISTS week_plan_versions (
  monday TEXT NOT NULL,
  version INTEGER NOT NULL,
  plan_json TEXT NOT NULL,
  generated_at TEXT NOT NULL,
  generated_by TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'full',
  note TEXT,
  PRIMARY KEY (monday, version)
);

CREATE TABLE IF NOT EXISTS employee_generation_settings (
  employee_id TEXT PRIMARY KEY,
  settings_json TEXT NOT NULL,
  updated_by TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Den aktuell aktiven Altbestand einmalig als Version sichern, falls noch kein Eintrag existiert.
INSERT OR IGNORE INTO week_plan_versions (monday, version, plan_json, generated_at, generated_by, mode, note)
SELECT monday, version, plan_json, generated_at, generated_by, 'legacy', 'Beim Update auf v5.6 übernommen'
FROM week_plans;
