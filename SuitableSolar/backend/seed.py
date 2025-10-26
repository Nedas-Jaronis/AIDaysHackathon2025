# Loads CSV
import csv
import sqlite3
from pathlib import Path
from dotenv import load_dotenv
from CONSTANTS import DATABASE, CSV_FILE  # import constants explicitly

# Database file path (same folder as this script)
DB_PATH = Path(__file__).parent / DATABASE

# CSV file path (relative to this script, e.g., ../data/final_dataset.csv)
CSV_PATH = Path(__file__).parent / CSV_FILE

# Known columns (in table). Extra CSV columns are ignored gracefully.
TABLE_COLS = [
    "Address", "Latitude", "Longitude", "Annual_GHI", "Annual_DNI", "Annual_Tilt_Latitude",
    "GHI_jan", "GHI_feb", "GHI_mar", "GHI_apr", "GHI_may", "GHI_jun", "GHI_jul", "GHI_aug",
    "GHI_sep", "GHI_oct", "GHI_nov", "GHI_dec", "nearest_substation_km", "tilt_deg",
    "solar_score", "acres", "price"
]


def to_null_or_float(v):
    if v is None or v == "":
        return None
    try:
        return float(v)
    except ValueError:
        return v  # leave address as text; others will fail constraints if wrong


def main():
    if not CSV_PATH.exists():
        raise SystemExit(f"CSV not found: {CSV_PATH}")

    with sqlite3.connect(DB_PATH) as con, CSV_PATH.open(newline="", encoding="utf-8") as f:
        con.execute("PRAGMA journal_mode=WAL;")
        rdr = csv.DictReader(f)
        rows = 0
        placeholders = ",".join([f":{c}" for c in TABLE_COLS])
        sql = f"""INSERT OR IGNORE INTO locations ({",".join(TABLE_COLS)})
                  VALUES ({placeholders})"""
        for raw in rdr:
            payload = {}
            for c in TABLE_COLS:
                val = raw.get(c, None)
                payload[c] = val if c == "address" else to_null_or_float(val)
            con.execute(sql, payload)
            rows += 1
        con.commit()
    print(f"✅ Imported {rows} rows from {CSV_PATH}")


if __name__ == "__main__":
    main()
