from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
from pathlib import Path
from typing import List, Optional
from pydantic import BaseModel


DB_PATH = Path(__file__).parent / "locations.db"


app = FastAPI(title="Solar Land API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Property(BaseModel):
    id: int
    address: str
    latitude: float
    longitude: float
    annual_ghi: Optional[float]
    annual_dni: Optional[float]
    annual_tilt_latitude: Optional[float]
    ghi_jan: Optional[float]
    ghi_feb: Optional[float]
    ghi_mar: Optional[float]
    ghi_apr: Optional[float]
    ghi_may: Optional[float]
    ghi_jun: Optional[float]
    ghi_jul: Optional[float]
    ghi_aug: Optional[float]
    ghi_sep: Optional[float]
    ghi_oct: Optional[float]
    ghi_nov: Optional[float]
    ghi_dec: Optional[float]
    nearest_substation_km: Optional[float]
    tilt_deg: Optional[float]
    solar_score: Optional[float]
    acres: Optional[float]
    price: Optional[float]


def map_db_row_to_property_dict(row: sqlite3.Row) -> dict:
    return {
        "id": row["id"],
        "address": row["Address"],
        "latitude": row["Latitude"],
        "longitude": row["Longitude"],
        "annual_ghi": row["Annual_GHI"],
        "annual_dni": row["Annual_DNI"],
        "annual_tilt_latitude": row["Annual_Tilt_Latitude"],
        "ghi_jan": row["GHI_jan"],
        "ghi_feb": row["GHI_feb"],
        "ghi_mar": row["GHI_mar"],
        "ghi_apr": row["GHI_apr"],
        "ghi_may": row["GHI_may"],
        "ghi_jun": row["GHI_jun"],
        "ghi_jul": row["GHI_jul"],
        "ghi_aug": row["GHI_aug"],
        "ghi_sep": row["GHI_sep"],
        "ghi_oct": row["GHI_oct"],
        "ghi_nov": row["GHI_nov"],
        "ghi_dec": row["GHI_dec"],
        "nearest_substation_km": row["nearest_substation_km"],
        "tilt_deg": row["tilt_deg"],
        "solar_score": row["solar_score"],
        "acres": row["acres"],
        "price": row["price"],
    }


def fetch_properties() -> List[Property]:
    if not DB_PATH.exists():
        raise FileNotFoundError(f"Database not found at {DB_PATH}")

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    cur.execute("SELECT * FROM locations")
    rows = cur.fetchall()
    conn.close()

    properties = []
    for row in rows:
        data = map_db_row_to_property_dict(row)
        properties.append(Property(**data))
    return properties


@app.get("/properties", response_model=List[Property])
def get_properties():
    try:
        return fetch_properties()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/properties/{property_id}", response_model=Property)
def get_property(property_id: int):
    try:
        props = fetch_properties()
        for p in props:
            if p.id == property_id:
                return p
        raise HTTPException(status_code=404, detail="Property not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
