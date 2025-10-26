# Create locations.db and table
import sqlite3
from pathlib import Path
from CONSTANTS import DATABASE

DB_PATH = Path(__file__).with_name(DATABASE)

DDL = """
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS locations (
  id                      INTEGER PRIMARY KEY AUTOINCREMENT,
  Address                 TEXT NOT NULL UNIQUE,
  Latitude                REAL NOT NULL,
  Longitude               REAL NOT NULL,
  Annual_GHI              REAL,
  Annual_DNI              REAL,
  Annual_Tilt_Latitude    REAL,
  GHI_jan                 REAL,
  GHI_feb                 REAL,
  GHI_mar                 REAL,
  GHI_apr                 REAL,
  GHI_may                 REAL,
  GHI_jun                 REAL,
  GHI_jul                 REAL,
  GHI_aug                 REAL,
  GHI_sep                 REAL,
  GHI_oct                 REAL,
  GHI_nov                 REAL,
  GHI_dec                 REAL,
  nearest_substation_km   REAL,
  tilt_deg                REAL,
  solar_score             REAL,
  acres                   REAL,
  price                   REAL,
  created_at              TEXT DEFAULT (datetime('now')),
  updated_at              TEXT DEFAULT (datetime('now')),

  CHECK (Latitude BETWEEN -90 AND 90),
  CHECK (Longitude BETWEEN -180 AND 180),
  CHECK (Annual_Tilt_Latitude IS NULL OR (Annual_Tilt_Latitude BETWEEN 0 AND 90)),
  CHECK (tilt_deg IS NULL OR (tilt_deg BETWEEN 0 AND 90)),
  CHECK (solar_score IS NULL OR solar_score >= 0),
  CHECK (Annual_GHI IS NULL OR Annual_GHI >= 0),
  CHECK (Annual_DNI IS NULL OR Annual_DNI >= 0),
  CHECK (acres IS NULL OR acres >= 0),
  CHECK (price IS NULL OR price >= 0)
);

-- simple indexes for common filters/sorts
CREATE INDEX IF NOT EXISTS idx_locations_lat_lon      ON locations (Latitude, Longitude);
CREATE INDEX IF NOT EXISTS idx_locations_solar_score  ON locations (solar_score);
CREATE INDEX IF NOT EXISTS idx_locations_Annual_GHI   ON locations (Annual_GHI);
CREATE INDEX IF NOT EXISTS idx_locations_Annual_DNI   ON locations (Annual_DNI);
CREATE INDEX IF NOT EXISTS idx_locations_tilt_deg     ON locations (tilt_deg);

-- trigger to keep updated_at fresh
CREATE TRIGGER IF NOT EXISTS trg_locations_touch
AFTER UPDATE ON locations
FOR EACH ROW
BEGIN
  UPDATE locations SET updated_at = datetime('now') WHERE id = OLD.id;
END;
"""


def main():
    DB_PATH.touch(exist_ok=True)
    with sqlite3.connect(DB_PATH) as con:
        con.executescript(DDL)
    print(f"✅ Schema ready at {DB_PATH}")


if __name__ == "__main__":
    main()
