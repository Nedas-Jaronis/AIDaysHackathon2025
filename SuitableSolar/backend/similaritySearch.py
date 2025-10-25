import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import NearestNeighbors
import numpy as np

def load_and_preprocess(csv_path):
    # Load the CSV
    df = pd.read_csv(csv_path)

    # Select numeric feature columns for similarity search
    feature_cols = [
        'Latitude', 'Longitude', 'Annual_GHI', 'Annual_DNI', 'Annual_Tilt_Latitude',
        'GHI_jan', 'GHI_feb', 'GHI_mar', 'GHI_apr', 'GHI_may', 'GHI_jun', 'GHI_jul',
        'GHI_aug', 'GHI_sep', 'GHI_oct', 'GHI_nov', 'GHI_dec', 'nearest_substation_km'
    ]

    # Extract the feature matrix
    X = df[feature_cols].values

    # Normalize features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    return df, X_scaled, scaler

def find_similar_properties(X_scaled, scaler, df, query_features, k=3):
    # Scale query features using the same scaler
    query_scaled = scaler.transform([query_features])

    # Fit KNN model
    knn = NearestNeighbors(n_neighbors=k, metric='euclidean')
    knn.fit(X_scaled)

    # Find nearest neighbors
    distances, indices = knn.kneighbors(query_scaled)

    # Display results
    print(f"Top {k} similar properties:\n")
    for rank, idx in enumerate(indices[0]):
        print(f"Rank {rank+1}:")
        print(df.iloc[idx])
        print(f"Distance: {distances[0][rank]:.4f}\n")

if __name__ == "__main__":
    # Path to your CSV file
    csv_path = "backend/data/solar_with_nearest_substation.csv"  # Change to your actual filename

    # Load and preprocess data
    df, X_scaled, scaler = load_and_preprocess(csv_path)

    # Example query features matching order of feature_cols:
    query_features = [
        40.197728,  # Latitude
        -74.217988, # Longitude
        4.03,       # Annual_GHI
        4.0,        # Annual_DNI
        4.74,       # Annual_Tilt_Latitude
        2.03, 3.0, 4.03, 4.89, 5.57, 5.9, 5.99, 5.28, 4.34, 3.19, 2.24, 1.84, 0.733 # monthly GHI & substation
    ]

    # Find and print top 3 similar plots
    find_similar_properties(X_scaled, scaler, df, query_features, k=3)
