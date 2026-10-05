CREATE TABLE IF NOT EXISTS vehicles (
  number INTEGER PRIMARY KEY, label TEXT NOT NULL, model TEXT NOT NULL, status TEXT NOT NULL, group_type TEXT NOT NULL,
  regular INTEGER NOT NULL DEFAULT 0, alternative INTEGER NOT NULL DEFAULT 0, large INTEGER NOT NULL DEFAULT 0, regio INTEGER NOT NULL DEFAULT 0,
  advertising TEXT, special TEXT, source_row INTEGER, synced_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS fleet_sync_state (
  id INTEGER PRIMARY KEY CHECK(id=1), source_url TEXT NOT NULL, last_success_at TEXT, last_attempt_at TEXT NOT NULL, status TEXT NOT NULL, message TEXT,
  vehicle_count INTEGER NOT NULL DEFAULT 0, active_count INTEGER NOT NULL DEFAULT 0, unavailable_count INTEGER NOT NULL DEFAULT 0
);
