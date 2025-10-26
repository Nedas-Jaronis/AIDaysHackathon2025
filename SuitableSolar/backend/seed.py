# Loads CSV
import csv
import sqlite3
from pathlib import Path
from dotenv import load_dotenv
from CONSTANTS import *

DB_PATH = DATABASE
BASE_DIR = Path(__file__).resolve().parent
CSV_FILE = BASE_DIR / "data" / "final_dataset.csv"
CSV_FILE = Path(CSV_FILE)

# Known columns (in table). Extra CSV columns are ignored gracefully.
TABLE_COLS = [
    "address","latitude","longitude","annual_ghi","annual_tilt",
    "grid_distance","solar_score","area","slope","solar_day_length"
]

def to_null_or_float(v):
    if v is None or v == "": return None
    try:
        return float(v)
    except ValueError:
        return v  # leave address as text; others will fail constraints if wrong

def main():
    if not CSV_FILE.exists():
        raise SystemExit(f"CSV not found: {CSV_FILE}")

    with sqlite3.connect(DB_PATH) as con, CSV_FILE.open(newline="", encoding="utf-8") as f:
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
    print(f"✅ Imported {rows} rows from {CSV_FILE}")

if __name__ == "__main__":
    main()
