import requests
import json

# Your API credentials
API_KEY = "vR8le25b3vHo6kMP4nsv8HxkFbvDPRkuyQLl5X8n"
EMAIL = "jaronisnedas@ufl.edu"

lat = 27.7
lon = -81.7  # Note: US longitudes should be NEGATIVE

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

    print(f"Status Code: {response.status_code}")

    if response.status_code == 200:
        data = response.json()

        if 'errors' in data:
            print("\n⚠️ API returned errors:")
            print(json.dumps(data['errors'], indent=2))

        print("\nFull API Response:")
        print(json.dumps(data, indent=2))

        if 'outputs' in data:
            print("\n" + "=" * 50)
            print("KEY SOLAR METRICS:")
            print("=" * 50)

            outputs = data['outputs']

            print(
                f"\nAnnual Average GHI: {outputs['avg_ghi']['annual']} kWh/m²/day")
            print(
                f"Annual Average DNI: {outputs['avg_dni']['annual']} kWh/m²/day")
            print(
                f"Annual Average Tilt at Latitude: {outputs['avg_lat_tilt']['annual']} kWh/m²/day")

            print("\nMonthly GHI Data:")
            for month, value in outputs['avg_ghi']['monthly'].items():
                print(f"  {month}: {value} kWh/m²/day")
        else:
            print("\n⚠️ No 'outputs' data in response")

    else:
        print(f"\n❌ Error: API returned status code {response.status_code}")
        print(f"Response: {response.text}")

except Exception as e:
    print(f"\n❌ Error occurred: {str(e)}")
    import traceback
    traceback.print_exc()
