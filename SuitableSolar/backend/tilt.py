import pandas as pd
import numpy as np
import requests
import math

# ------------------------------
# Helper Functions
# ------------------------------


def generate_coordinates(lat, lon, radius_m, step_m=50):
    """
    Generate a grid of latitude and longitude points within a circular radius.
    """
    lat_step = step_m / 111320
    lon_step = step_m / (40008000 * np.cos(np.radians(lat)) / 360)

    latitudes = np.arange(lat - radius_m/111320, lat +
                          radius_m/111320, lat_step)
    longitudes = np.arange(lon - radius_m/(40008000*np.cos(np.radians(lat))/360),
                           lon + radius_m /
                           (40008000*np.cos(np.radians(lat))/360),
                           lon_step)
    return [(lat, lon) for lat in latitudes for lon in longitudes]


def fetch_elevation(lat, lon):
    """
    Fetch elevation from Open-Meteo API.
    Returns a float (meters) or None.
    """
    url = f"https://api.open-meteo.com/v1/elevation?latitude={lat}&longitude={lon}"
    try:
        resp = requests.get(url, timeout=10)
        data = resp.json()
        elev = data.get('elevation', None)
        # If API returns a list, take first element
        if isinstance(elev, list):
            elev = elev[0]
        return elev
    except:
        return None


def compute_tilt(elevations, distances):
    """
    Compute approximate average tilt (degrees) from elevations and distances.
    Skips None values.
    """
    flat_elev = [e for e in elevations if isinstance(e, (int, float))]
    flat_dist = [d for d in distances if isinstance(d, (int, float))]

    if len(flat_elev) < 2 or len(flat_dist) == 0:
        return 0

    dz = max(flat_elev) - min(flat_elev)
    dx = max(flat_dist)

    return math.degrees(math.atan(dz/dx)) if dx != 0 else 0

# ------------------------------
# Main Function
# ------------------------------


def add_tilt_to_csv(input_csv, output_csv):
    """
    Reads properties CSV, computes tilt for each property, and saves to new CSV.
    """
    df = pd.read_csv(input_csv)
    tilts = []

    for idx, row in df.iterrows():
        lat = row['latitude']
        lon = row['longitude']
        acres = row['acres']

        # Convert acres to radius in meters
        radius_m = math.sqrt(acres * 4046.86 / math.pi)

        # Generate grid points
        coords = generate_coordinates(lat, lon, radius_m, step_m=radius_m/5)

        elevations = []
        distances = []

        for clat, clon in coords:
            elev = fetch_elevation(clat, clon)
            if elev is not None:
                elevations.append(elev)

                # Distance from center in meters
                d_lat = (clat - lat) * 111320
                d_lon = (clon - lon) * (40008000 *
                                        np.cos(np.radians(lat)) / 360)
                distances.append(math.hypot(d_lat, d_lon))

        tilt_deg = compute_tilt(elevations, distances)
        tilts.append(tilt_deg)
        print(f"Processed property {idx+1}/{len(df)}: Tilt ≈ {tilt_deg:.2f}°")

    df['tilt_deg'] = tilts
    df.to_csv(output_csv, index=False)
    print(f"\nSaved results to {output_csv}")


if __name__ == "__main__":
    add_tilt_to_csv('backend/data/newdata.csv',
                    'backend/data/properties_with_tilt.csv')
