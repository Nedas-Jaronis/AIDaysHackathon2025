import csv
import random

OUTPUT_FILE = "test.csv"

# Latitude/longitude around Gainesville, FL
LAT_CENTER = 29.6516
LON_CENTER = -82.3248

# Address parts
street_names = [
    "Main", "Oak", "Pine", "Maple", "Birch", "Cedar", "Elm", "Palm", "Ash", "Walnut",
    "Highland", "Lakeview", "Ridge", "Sunset", "Forest", "Creek", "Hillcrest", "Magnolia",
    "College", "Center", "Glen", "Garden", "Valley", "River", "Spring"
]
street_types = ["St", "Ave", "Dr", "Ct", "Ln", "Blvd", "Way", "Pl", "Rd", "Terrace"]

# Column order
columns = [
    "address", "latitude", "longitude", "annual_ghi", "annual_tilt",
    "grid_distance", "solar_score", "area", "slope", "solar_day_length"
]

def random_lat_lon():
    return (
        LAT_CENTER + random.uniform(-0.02, 0.02),    # ~2.2km radius area in latitude
        LON_CENTER + random.uniform(-0.02, 0.02)     # ~2.2km radius area in longitude
    )

def generate_row():
    lat, lon = random_lat_lon()
    address = f"{random.randint(100, 9999)} {random.choice(street_names)} {random.choice(street_types)}, Gainesville, FL"

    return {
        "address": address,
        "latitude": round(lat, 6),
        "longitude": round(lon, 6),
        "annual_ghi": round(random.uniform(1600, 2200), 1),
        "annual_tilt": round(random.uniform(10, 40), 1),
        "grid_distance": round(random.uniform(0.2, 10.0), 2),
        "solar_score": round(random.uniform(50, 100), 1),
        "area": round(random.uniform(50, 300), 1),
        "slope": round(random.uniform(0, 25), 1),
        "solar_day_length": round(random.uniform(10, 14), 2),
    }

def main():
    rows = [generate_row() for _ in range(200)]
    with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=columns)
        writer.writeheader()
        writer.writerows(rows)
    print(f"✅ Generated {OUTPUT_FILE} with {len(rows)} rows.")

if __name__ == "__main__":
    main()
