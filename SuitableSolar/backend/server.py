from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
from pathlib import Path
from typing import List, Optional
from pydantic import BaseModel
import joblib
from forecastModel import multi_year_forecast
import pandas as pd
import os
from fastapi.responses import JSONResponse
from fastapi.exception_handlers import RequestValidationError
from fastapi import Request
from fastapi.exceptions import RequestValidationError

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


def fetch_properties() -> List[Property]:
    # Check if database file exists
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


base_dir = os.path.dirname(os.path.abspath(__file__))

clf = joblib.load(os.path.join(base_dir, 'models', 'clf.joblib'))
reg_renew = joblib.load(os.path.join(base_dir, 'models', 'reg_renew.joblib'))
reg_nonrenew = joblib.load(os.path.join(
    base_dir, 'models', 'reg_nonrenew.joblib'))

models = {'clf': clf, 'reg_renew': reg_renew, 'reg_nonrenew': reg_nonrenew}

# Preprocess df by adding change and lag columns
df = pd.read_csv('data/state_energy_summary.csv')
df = df.sort_values(['State', 'Year'])

# Calculate change columns grouped by state
df['Renewable_change'] = df.groupby('State')['PercentRenewable'].diff()
df['NonRenewable_change'] = df.groupby('State')['PercentNonRenewable'].diff()

lags = 3
for lag in range(1, lags + 1):
    df[f'PercentRenewable_lag{lag}'] = df.groupby(
        'State')['PercentRenewable'].shift(lag)
    df[f'PercentNonRenewable_lag{lag}'] = df.groupby(
        'State')['PercentNonRenewable'].shift(lag)
    df[f'Renewable_change_lag{lag}'] = df.groupby(
        'State')['Renewable_change'].shift(lag)
    df[f'NonRenewable_change_lag{lag}'] = df.groupby(
        'State')['NonRenewable_change'].shift(lag)

feature_cols = [
    "PercentRenewable", "PercentNonRenewable", "TotalEnergy",
    "Renewable_change", "NonRenewable_change"
]
feature_cols += [f"PercentRenewable_lag{i}" for i in range(1, lags + 1)]
feature_cols += [f"PercentNonRenewable_lag{i}" for i in range(1, lags + 1)]
feature_cols += [f"Renewable_change_lag{i}" for i in range(1, lags + 1)]
feature_cols += [f"NonRenewable_change_lag{i}" for i in range(1, lags + 1)]


@app.get("/forecast")
def get_forecast(
    state: str = Query(..., min_length=2, max_length=2),
    years_ahead: int = Query(..., ge=1, le=100)
):
    state = state.upper()
    state_data = df[df['State'] == state].sort_values('Year')

    if state_data.empty:
        raise HTTPException(status_code=404, detail="State data not found")

    latest_row = state_data.iloc[-1]

    # Check that all feature columns exist and have non-null values for this row
    missing_cols = [
        col for col in feature_cols if col not in latest_row or pd.isnull(latest_row[col])]
    if missing_cols:
        raise HTTPException(
            status_code=500, detail=f"Missing required data columns: {missing_cols}")

    initial_features_df = latest_row[feature_cols].to_frame().T

    start_year = int(latest_row['Year'])

    forecast_df = multi_year_forecast(
        initial_features_df=initial_features_df,
        start_year=start_year,
        years_ahead=years_ahead,
        models=models,
        feature_cols=feature_cols,
        lags=lags
    )

    avg_percent_renewable = forecast_df['Pred_PercentRenewable'].mean()
    predicted_increase = avg_percent_renewable - \
        initial_features_df['PercentRenewable'].iloc[0]

    return {
        "current_percent_renewable": initial_features_df['PercentRenewable'].iloc[0],
        "average_forecast_percent_renewable": avg_percent_renewable,
        "predicted_increase": predicted_increase
    }


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )
