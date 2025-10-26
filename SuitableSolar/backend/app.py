from math import radians, sin, cos, asin, sqrt
from pathlib import Path
import sqlite3
from flask import Flask, request, jsonify

DB_PATH = Path(__file__).with_name("locations.db")

app = Flask(__name__)

# CORS (allow all)
@app.after_request
def add_cors_headers(resp):
    resp.headers["Access-Control-Allow-Origin"] = "*"
    resp.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    resp.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return resp

def db():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    return con

# Haversine distance in kilometers
def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0088
    lat1, lon1, lat2, lon2 = map(radians, [lat1,lon1,lat2,lon2])
    dlat, dlon = lat2-lat1, lon2-lon1
    a = sin(dlat/2)**2 + cos(lat1)*cos(lat2)*sin(dlon/2)**2
    return 2*R*asin(sqrt(a))

def bbox(lat, lon, km):
    lat_deg = km / 111.0
    lon_deg = km / (111.0 * max(0.0001, cos(radians(lat))))
    return (lat - lat_deg, lat + lat_deg, lon - lon_deg, lon + lon_deg)

ALLOWED_SORT = {"id","solar_score","annual_ghi","grid_distance","slope","area","solar_day_length"}

@app.get("/locations")
def list_locations():
    import math
    # filters & paging
    q = request.args.get("q")
    min_score = request.args.get("min_score", type=float)
    max_slope = request.args.get("max_slope", type=float)
    min_ghi = request.args.get("min_ghi", type=float)
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)
    max_km = request.args.get("max_km_from", type=float)

    limit = min(max(request.args.get("limit", default=50, type=int), 1), 200)
    page = max(request.args.get("page", default=1, type=int), 1)
    offset = (page - 1) * limit

    sort = request.args.get("sort", default="id")
    order = request.args.get("order", default="asc").lower()
    if sort not in ALLOWED_SORT: sort = "id"
    if order not in {"asc","desc"}: order = "asc"

    where = []
    params = {}

    if q:
        where.append("address LIKE :q")
        params["q"] = f"%{q}%"
    if min_score is not None:
        where.append("solar_score >= :min_score")
        params["min_score"] = min_score
    if max_slope is not None:
        where.append("slope <= :max_slope")
        params["max_slope"] = max_slope
    if min_ghi is not None:
        where.append("annual_ghi >= :min_ghi")
        params["min_ghi"] = min_ghi

    # Distance prefilter
    bbox_sql = ""
    if (lat is not None) and (lon is not None) and (max_km is not None):
        lat_min, lat_max, lon_min, lon_max = bbox(lat, lon, max_km * 1.2)
        bbox_sql = " AND latitude BETWEEN :lat_min AND :lat_max AND longitude BETWEEN :lon_min AND :lon_max"
        params.update({"lat_min": lat_min, "lat_max": lat_max, "lon_min": lon_min, "lon_max": lon_max})

    where_sql = ("WHERE " + " AND ".join(where)) if where else ""

    # 1) Total row count (for pagination metadata)
    count_sql = f"SELECT COUNT(*) FROM locations {where_sql} {bbox_sql}"
    with db() as con:
        total_rows = con.execute(count_sql, params).fetchone()[0]

    total_pages = math.ceil(total_rows / limit) if total_rows > 0 else 1

    # If page is out of range → return empty items (O1)
    if page > total_pages:
        return jsonify({
            "page": page,
            "limit": limit,
            "total_rows": total_rows,
            "total_pages": total_pages,
            "items": []
        })

    # 2) Paged query
    sql = f"""
        SELECT id, address, latitude, longitude, annual_ghi, annual_tilt,
               grid_distance, solar_score, area, slope, solar_day_length
        FROM locations
        {where_sql} {bbox_sql}
        ORDER BY {sort} {order}
        LIMIT :limit OFFSET :offset
    """
    params.update({"limit": limit, "offset": offset})

    with db() as con:
        rows = con.execute(sql, params).fetchall()

    data = [dict(r) for r in rows]

    # Final distance filter + sort
    if (lat is not None) and (lon is not None) and (max_km is not None):
        for r in data:
            r["distance_km"] = haversine_km(lat, lon, r["latitude"], r["longitude"])
        data = [r for r in data if r["distance_km"] <= max_km]
        data.sort(key=lambda x: x["distance_km"])

    return jsonify({
        "page": page,
        "limit": limit,
        "total_rows": total_rows,
        "total_pages": total_pages,
        "items": data
    })

@app.get("/locations/<int:loc_id>")
def get_location(loc_id):
    with db() as con:
        row = con.execute("SELECT * FROM locations WHERE id = ?", (loc_id,)).fetchone()
        if not row:
            return jsonify({"error":"not found"}), 404
        return jsonify(dict(row))

@app.get("/locations/search")
def search_locations():
    q = request.args.get("q","")
    limit = min(max(request.args.get("limit", default=50, type=int), 1), 200)
    with db() as con:
        rows = con.execute("""
            SELECT id, address, latitude, longitude, solar_score
            FROM locations
            WHERE address LIKE ?
            ORDER BY id ASC
            LIMIT ?
        """, (f"%{q}%", limit)).fetchall()
    return jsonify([dict(r) for r in rows])

@app.get("/locations/nearest")
def nearest():
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)
    limit = min(max(request.args.get("limit", default=20, type=int), 1), 200)
    if lat is None or lon is None:
        return jsonify({"error":"lat and lon required"}), 400

    # prefilter ~25 km box
    lat_min, lat_max, lon_min, lon_max = bbox(lat, lon, 25.0)
    with db() as con:
        rows = con.execute("""
            SELECT id, address, latitude, longitude, solar_score
            FROM locations
            WHERE latitude BETWEEN ? AND ?
              AND longitude BETWEEN ? AND ?
            LIMIT 1000
        """, (lat_min, lat_max, lon_min, lon_max)).fetchall()

    data = [dict(r) for r in rows]
    for r in data:
        r["distance_km"] = haversine_km(lat, lon, r["latitude"], r["longitude"])
    data.sort(key=lambda x: x["distance_km"])
    return jsonify(data[:limit])

@app.get("/locations/radius")
def radius():
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)
    km  = request.args.get("km",  type=float)
    if lat is None or lon is None or km is None:
        return jsonify({"error":"lat, lon, km required"}), 400

    lat_min, lat_max, lon_min, lon_max = bbox(lat, lon, km * 1.2)
    with db() as con:
        rows = con.execute("""
            SELECT id, address, latitude, longitude, solar_score
            FROM locations
            WHERE latitude BETWEEN ? AND ?
              AND longitude BETWEEN ? AND ?
            LIMIT 5000
        """, (lat_min, lat_max, lon_min, lon_max)).fetchall()

    data = [dict(r) for r in rows]
    out = []
    for r in data:
        d = haversine_km(lat, lon, r["latitude"], r["longitude"])
        if d <= km:
            r["distance_km"] = d
            out.append(r)
    out.sort(key=lambda x: x["distance_km"])
    return jsonify(out)

if __name__ == "__main__":
    app.run(debug=True)
