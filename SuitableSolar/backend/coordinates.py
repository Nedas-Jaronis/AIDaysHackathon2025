import requests
import pandas as pd
import time

# --- Configuration ---
INPUT_CSV = "backend/data/addresses.csv"       # your input file with addresses
OUTPUT_CSV = "backend/data/addresses_geocoded.csv"
ADDRESS_COLUMN = "Address"        # name of the column in your CSV with the address
DELAY = 1                         # seconds between requests (to respect OSM rate limits)

# --- Read CSV ---
df = pd.read_csv(INPUT_CSV)

# Add columns for latitude and longitude
df["latitude"] = None
df["longitude"] = None

# --- Geocode each address ---
for i, row in df.iterrows():
    address = row[ADDRESS_COLUMN]
    print(f"Geocoding ({i+1}/{len(df)}): {address}")

    try:
        url = f"https://nominatim.openstreetmap.org/search"
        params = {
            "q": address,
            "format": "json",
            "limit": 1
        }

        headers = {
            "User-Agent": "HackathonSolarSuitabilityAnalyzer/1.0"
        }

        response = requests.get(url, params=params, headers=headers)
        data = response.json()

        if data:
            df.at[i, "latitude"] = data[0]["lat"]
            df.at[i, "longitude"] = data[0]["lon"]
        else:
            print(f"⚠️ No results for: {address}")

    except Exception as e:
        print(f"❌ Error geocoding {address}: {e}")

    # Respect Nominatim usage policy (1 request per second max)
    time.sleep(DELAY)

# --- Save the new CSV ---
df.to_csv(OUTPUT_CSV, index=False)
print(f"\n✅ Geocoding complete! Results saved to {OUTPUT_CSV}")
