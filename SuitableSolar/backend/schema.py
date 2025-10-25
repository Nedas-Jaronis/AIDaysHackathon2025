# Create locations.db and table
import sqlite3
from pathlib import Path
from CONSTANTS import DATABASE

DB_PATH = Path(__file__).with_name(DATABASE)

DDL = """
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS locations (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  address          TEXT NOT NULL UNIQUE,
  latitude         REAL NOT NULL,
  longitude        REAL NOT NULL,
  annual_ghi       REAL,
  annual_tilt      REAL,
  grid_distance    REAL,
  solar_score      REAL,
  area             REAL,
  slope            REAL,
  solar_day_length REAL,
  created_at       TEXT DEFAULT (datetime('now')),
  updated_at       TEXT DEFAULT (datetime('now')),

  CHECK (latitude BETWEEN -90 AND 90),
  CHECK (longitude BETWEEN -180 AND 180),
  CHECK (annual_tilt IS NULL OR (annual_tilt BETWEEN 0 AND 90)),
  CHECK (slope IS NULL OR (slope BETWEEN 0 AND 90)),
  CHECK (solar_day_length IS NULL OR (solar_day_length BETWEEN 0 AND 24)),
  CHECK (annual_ghi IS NULL OR annual_ghi >= 0),
  CHECK (grid_distance IS NULL OR grid_distance >= 0),
  CHECK (area IS NULL OR area >= 0),
  CHECK (solar_score IS NULL OR solar_score >= 0)
);

-- simple indexes for common filters/sorts
CREATE INDEX IF NOT EXISTS idx_locations_lat_lon      ON locations (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_locations_solar_score  ON locations (solar_score);
CREATE INDEX IF NOT EXISTS idx_locations_annual_ghi   ON locations (annual_ghi);
CREATE INDEX IF NOT EXISTS idx_locations_grid_distance ON locations (grid_distance);
CREATE INDEX IF NOT EXISTS idx_locations_slope        ON locations (slope);

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
