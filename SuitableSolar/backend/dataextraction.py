import pandas as pd
import requests
import json
import time
from tqdm import tqdm

# Your API key
API_KEY = "vR8le25b3vHo6kMP4nsv8HxkFbvDPRkuyQLl5X8n"

# Input / Output paths
INPUT_FILE = "backend/data/newdata.csv"
OUTPUT_FILE = "backend/data/solar_results.csv"

# Base URL for NREL Solar Resource API
URL = "https://developer.nrel.gov/api/solar/solar_resource/v1.json"

# Read geocoded CSV
df = pd.read_csv(INPUT_FILE)


# Prepare result storage
results = []

print(f"Processing {len(df)} locations...")

# Iterate through each row
for _, row in tqdm(df.iterrows(), total=len(df)):
    lat = row["latitude"]
    lon = row["longitude"]
    address = row["address"]

    if pd.isna(lat) or pd.isna(lon):
        print(f"⚠️ Skipping {address} — missing coordinates")
        continue

    # Prepare request
    params = {
        "api_key": API_KEY,
        "lat": lat,
        "lon": lon
    }

    try:
        response = requests.get(URL, params=params)
        data = response.json()

        # Default values
        ghi_annual = dni_annual = tilt_annual = None
        ghi_monthly = {}

        if response.status_code == 200 and "outputs" in data and isinstance(data["outputs"], dict):
            outputs = data["outputs"]

            if all(k in outputs for k in ("avg_ghi", "avg_dni", "avg_lat_tilt")):
                ghi_annual = outputs["avg_ghi"].get("annual", None) if isinstance(
                    outputs["avg_ghi"], dict) else None
                dni_annual = outputs["avg_dni"].get("annual", None) if isinstance(
                    outputs["avg_dni"], dict) else None
                tilt_annual = outputs["avg_lat_tilt"].get("annual", None) if isinstance(
                    outputs["avg_lat_tilt"], dict) else None
                ghi_monthly = outputs["avg_ghi"].get(
                    "monthly", {}) if isinstance(outputs["avg_ghi"], dict) else {}

        # Store result
        results.append({
            "Address": address,
            "Latitude": lat,
            "Longitude": lon,
            "Annual_GHI": ghi_annual,
            "Annual_DNI": dni_annual,
            "Annual_Tilt_Latitude": tilt_annual,
            **{f"GHI_{m}": v for m, v in ghi_monthly.items()}
        })

        # Be nice to API
        time.sleep(1)

    except Exception as e:
        print(f"❌ Error for {address}: {e}")
        results.append({
            "Address": address,
            "Latitude": lat,
            "Longitude": lon,
            "Error": str(e)
        })
        time.sleep(1)

# Convert to DataFrame and export
result_df = pd.DataFrame(results)
result_df.to_csv(OUTPUT_FILE, index=False)

print(f"\n✅ Done! Results saved to: {OUTPUT_FILE}")
