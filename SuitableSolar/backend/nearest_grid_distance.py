import osmnx as ox
from shapely.geometry import Point
from geopy.distance import geodesic

def find_nearest_substation(lat, lon, dist_meters=50000):
    # Broad tags to cover substations and power stations
    tags = {
        'power': ['substation', 'station', 'generator', 'plant', 'transformer', 'switch', 'plant_cogeneration']
    }
    
    # Fetch all geometries tagged as specified within radius
    gdf = ox.geometries_from_point((lat, lon), dist=dist_meters, tags=tags)
    
    if gdf.empty:
        print("No power-related features found within search radius.")
        return None
    
    # Compute geodesic distances to all features
    point = Point(lon, lat)
    gdf['dist_km'] = gdf.geometry.centroid.apply(
        lambda geom: geodesic((lat, lon), (geom.y, geom.x)).km
    )
    
    # Sort by distance and return closest 
    nearest = gdf.sort_values('dist_km').iloc[0]
    
    return nearest['dist_km'], nearest.name, nearest

# Example usage
lat, lon = 29.6470209, -82.2977879
distance, osm_id, feature = find_nearest_substation(lat, lon)
print(f"Nearest substation approx. {distance:.2f} km away: OSM ID {osm_id}")
print(feature)
