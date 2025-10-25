import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import NearestNeighbors
import numpy as np

def load_and_preprocess(csv_path):

    df = pd.read_csv(csv_path)


    feature_cols = [
        'Latitude', 'Longitude', 'Annual_GHI', 'Annual_DNI', 'Annual_Tilt_Latitude', 'nearest_substation_km'
    ]

    X = df[feature_cols].values

    # Normalize features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    return df, X_scaled, scaler

def find_similar_properties(X_scaled, scaler, df, query_features, k=3):
    query_scaled = scaler.transform([query_features])

    knn = NearestNeighbors(n_neighbors=k, metric='euclidean')
    knn.fit(X_scaled)
    display_cols = [
        'Address', 'Latitude', 'Longitude', 'Annual_GHI', 'Annual_DNI',
        'Annual_Tilt_Latitude', 'nearest_substation_km'
    ]

    distances, indices = knn.kneighbors(query_scaled)

    print(f"Top {k} similar properties:\n")
    for rank, idx in enumerate(indices[0]):
        print(f"Rank {rank+1}:")
        print(df.loc[idx, display_cols])
        print(f"Distance: {distances[0][rank]:.4f}\n")

if __name__ == "__main__":
    csv_path = "backend/data/solar_with_nearest_substation.csv" 

    df, X_scaled, scaler = load_and_preprocess(csv_path)

    query_features = [
        40.197728,
        -74.217988,
        4.03,
        4.0,
        4.74,
        0.733
    ]

    find_similar_properties(X_scaled, scaler, df, query_features, k=3)
