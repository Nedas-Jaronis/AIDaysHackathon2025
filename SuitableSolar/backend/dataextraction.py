import requests
import json

# Your API credentials
API_KEY = ""
EMAIL = ""

# Test with one property location (Phoenix, Arizona - Sunset Valley Ranch)
lat = 33.4484
lon = -112.0740

# Simple API call to get solar resource data
url = f"https://developer.nrel.gov/api/solar/solar_resource/v1.json"

params = {
    "api_key": API_KEY,
    "lat": lat,
    "lon": lon
}

print("Making request to NREL API...")
print(f"Location: {lat}, {lon}")
print("-" * 50)

try:
    response = requests.get(url, params=params)

    # Check if request was successful
    if response.status_code == 200:
        data = response.json()

        # Pretty print the full response
        print("\nFull API Response:")
        print(json.dumps(data, indent=2))

        # Extract key solar metrics
        print("\n" + "=" * 50)
        print("KEY SOLAR METRICS:")
        print("=" * 50)

        outputs = data['outputs']

        print(
            f"\nAnnual Average GHI: {outputs['avg_ghi']['annual']} kWh/m²/day")
        print(f"Annual Average DNI: {outputs['avg_dni']['annual']} kWh/m²/day")
        print(
            f"Annual Average Tilt at Latitude: {outputs['avg_lat_tilt']['annual']} kWh/m²/day")

        print("\nMonthly GHI Data:")
        for month, value in outputs['avg_ghi']['monthly'].items():
            print(f"  {month}: {value} kWh/m²/day")

    else:
        print(f"Error: API returned status code {response.status_code}")
        print(f"Response: {response.text}")

except Exception as e:
    print(f"Error occurred: {str(e)}")
