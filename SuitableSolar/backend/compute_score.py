import pandas as pd
import numpy as np

def compute_solar_suitability(df: pd.DataFrame) -> pd.DataFrame:
    """
    Compute a Solar Suitability Score (0–100) for each property
    using irradiance strength, seasonal stability, latitude adjustment,
    tilt of the land, and proximity to the nearest substation.
    """

    # Ensure column names are stripped of spaces
    df.columns = df.columns.str.strip()

    # --- Step 1: Determine min/max for normalization ---
    min_ghi = df["Annual_GHI"].min()
    max_ghi = df["Annual_GHI"].max()
    max_distance = df["nearest_substation_km"].max()

    scores = []

    for _, row in df.iterrows():
        months = np.array([
            row["GHI_jan"], row["GHI_feb"], row["GHI_mar"], row["GHI_apr"],
            row["GHI_may"], row["GHI_jun"], row["GHI_jul"], row["GHI_aug"],
            row["GHI_sep"], row["GHI_oct"], row["GHI_nov"], row["GHI_dec"]
        ], dtype=float)

        # 1️⃣ Irradiance Strength (normalized)
        irradiance = (row["Annual_GHI"] + row["Annual_Tilt_Latitude"]) / 2
        normalized_irr = (irradiance - min_ghi) / (max_ghi - min_ghi) if max_ghi != min_ghi else 1

        # 2️⃣ Seasonal Stability
        mean_ghi = np.mean(months)
        stdev_ghi = np.std(months)
        stability = 1 - (stdev_ghi / mean_ghi) if mean_ghi != 0 else 0

        # 3️⃣ Latitude Adjustment
        lat_factor = 1 - (abs(row["Latitude"]) / 90) * 0.3

        # 4️⃣ Tilt Factor
        optimal_tilt = abs(row["Latitude"])
        tilt_factor = 1 - (abs(row["tilt_deg"] - optimal_tilt) / 90)  # scaled 0-1

        # 5️⃣ Substation Distance Factor
        distance_factor = 1 - (row["nearest_substation_km"] / max_distance) if max_distance != 0 else 1

        # Combine (weighted)
        score = ((normalized_irr * 0.4) +      # 40%
                 (stability * 0.2) +           # 20%
                 (lat_factor * 0.1) +          # 10%
                 (tilt_factor * 0.15) +        # 15%
                 (distance_factor * 0.15)) * 100  # 15%

        scores.append(np.clip(score, 0, 100))

    # Add new column to the original dataframe
    df["solar_score"] = scores
    return df


if __name__ == "__main__":
    # Load original CSV (with tilt_deg and nearest_substation_km already included)
    df = pd.read_csv("backend/data/final_dataset.csv")

    # Compute and append scores
    df = compute_solar_suitability(df)

    # Save back to the same CSV or a new one
    df.to_csv("backend/data/final_dataset.csv", index=False)

    print("✅ Solar Suitability Scores added to CSV.")
