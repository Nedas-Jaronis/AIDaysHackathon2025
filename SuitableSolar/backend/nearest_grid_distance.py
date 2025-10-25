import pandas as pd
import osmnx as ox
from shapely.geometry import Point
from geopy.distance import geodesic
from tqdm import tqdm

# Paths and config
INPUT_FILE = "backend/data/solar_results.csv"
OUTPUT_FILE = "backend/data/solar_with_nearest_substation.csv"
SEARCH_RADIUS_METERS = 50000  # 50 km

# Load your data
df = pd.read_csv(INPUT_FILE)
tqdm.pandas()

def get_substations(lat, lon, dist=SEARCH_RADIUS_METERS):
    tags = {
        'power': ['substation', 'station', 'plant', 'transformer', 'switch']
    }
    try:
        gdf = ox.features_from_point((lat, lon), tags, dist=dist)
        if gdf.empty:
            return None

        # Reproject to a projected CRS for accurate centroid calculation (use UTM for your point)
        utm_crs = ox.projection.project_gdf(gdf).crs  # Projected CRS appropriate for features
        gdf_proj = gdf.to_crs(utm_crs)

        # Calculate centroids on projected CRS
        centroids = gdf_proj.geometry.centroid

        # Convert centroids back to geographic CRS (lat/lon) for distance calculation
        centroids_latlon = centroids.to_crs(gdf.crs)

        point = Point(lon, lat)
        # Calculate geodesic distance from input point to each centroid
        gdf['dist_km'] = centroids_latlon.apply(lambda geom: geodesic((lat, lon), (geom.y, geom.x)).km)

        return gdf

    except Exception as e:
        print(f"⚠️ Failed to fetch OSM power features near ({lat}, {lon}): {e}")
        return None

def find_nearest_substation(lat, lon):
    gdf = get_substations(lat, lon)
    if gdf is None or gdf.empty:
        return None  # Or return a sentinel value like -1 or np.nan if preferred

    # Return the minimum distance in km to the closest power-related feature
    return gdf['dist_km'].min()

# Apply the nearest substation finder to each row in the DataFrame
df['nearest_substation_km'] = df.progress_apply(
    lambda row: find_nearest_substation(row['Latitude'], row['Longitude']),
    axis=1
)

# Save the updated dataframe to a new CSV file
df.to_csv(OUTPUT_FILE, index=False)
print(f"\n✅ Done! Output saved to {OUTPUT_FILE}")
