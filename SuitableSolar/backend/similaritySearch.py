import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import NearestNeighbors
import numpy as np


def load_and_preprocess(csv_path):

    df = pd.read_csv(csv_path)

    # Include all relevant features for similarity matching
    feature_cols = [
        'Latitude', 'Longitude', 'Annual_GHI', 'Annual_DNI', 'Annual_Tilt_Latitude',
        'nearest_substation_km', 'tilt_deg', 'solar_score', 'acres'
    ]

    X = df[feature_cols].values

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    return df, X_scaled, scaler


def find_similar_properties(X_scaled, scaler, df, query_features, k=3):
    query_scaled = scaler.transform([query_features])

    knn = NearestNeighbors(n_neighbors=k, metric='euclidean')
    knn.fit(X_scaled)

    display_cols = [
        'Address', 'Latitude', 'Longitude', 'Annual_GHI', 'Annual_DNI',
        'Annual_Tilt_Latitude', 'nearest_substation_km', 'tilt_deg',
        'solar_score', 'acres', 'price'
    ]

    distances, indices = knn.kneighbors(query_scaled)

    print(f"Top {k} similar properties:\n")
    for rank, idx in enumerate(indices[0]):
        print(f"Rank {rank+1}:")
        print(df.loc[idx, display_cols])
        print(f"Distance: {distances[0][rank]:.4f}\n")


if __name__ == "__main__":
    csv_path = "backend/data/final_dataset.csv"

    df, X_scaled, scaler = load_and_preprocess(csv_path)

    # Query features: [Latitude, Longitude, Annual_GHI, Annual_DNI, Annual_Tilt_Latitude,
    #                  nearest_substation_km, tilt_deg, solar_score, acres]
    query_features = [
        40.197728,   # Latitude
        -74.217988,  # Longitude
        4.03,        # Annual_GHI
        4.0,         # Annual_DNI
        4.74,        # Annual_Tilt_Latitude
        0.733,       # nearest_substation_km
        5.0,         # tilt_deg
        75.0,        # solar_score
        10.0         # acres
    ]

    find_similar_properties(X_scaled, scaler, df, query_features, k=3)
