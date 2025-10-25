import pandas as pd
import numpy as np

def compute_solar_suitability(df: pd.DataFrame) -> pd.DataFrame:
    """
    Compute a Solar Suitability Score (0–100) for each property
    using irradiance strength, seasonal stability, latitude adjustment,
    and proximity to the nearest grid/substation.
    """

    # --- Step 1: Determine min/max for normalization ---
    min_ghi = df["Annual_GHI"].min()
    max_ghi = df["Annual_GHI"].max()
    max_distance = df["Grid_Distance_km"].max()

    scores = []

    for _, row in df.iterrows():
        months = [
            row["GHI_jan"], row["GHI_feb"], row["GHI_mar"], row["GHI_apr"],
            row["GHI_may"], row["GHI_jun"], row["GHI_jul"], row["GHI_aug"],
            row["GHI_sep"], row["GHI_oct"], row["GHI_nov"], row["GHI_dec"]
        ]
        months = np.array(months, dtype=float)

        # 1️⃣ Irradiance Strength (normalized)
        irradiance = (row["Annual_GHI"] + row["Annual_Tilt_Latitude"]) / 2
        normalized_irr = (irradiance - min_ghi) / (max_ghi - min_ghi)

        # 2️⃣ Seasonal Stability
        mean_ghi = np.mean(months)
        stdev_ghi = np.std(months)
        stability = 1 - (stdev_ghi / mean_ghi) if mean_ghi != 0 else 0

        # 3️⃣ Latitude Adjustment
        lat_factor = 1 - (abs(row["Latitude"]) / 90) * 0.3

        # 4️⃣ Grid Distance Factor (closer is better)
        distance_factor = 1 - (row["Grid_Distance_km"] / max_distance) if max_distance != 0 else 1

        # Combine (weighted)
        score = ((normalized_irr * 0.5) +      # 50%
                 (stability * 0.2) +           # 20%
                 (lat_factor * 0.15) +         # 15%
                 (distance_factor * 0.15)) * 100  # 15%

        scores.append(np.clip(score, 0, 100))

    df["Solar_Suitability_Score"] = scores
    return df



if __name__ == "__main__":
    # Load existing CSV
    df = pd.read_csv("backend/data/solar_results.csv")

    # Compute solar suitability
    df = compute_solar_suitability(df)

    # Keep only Address and Solar_Suitability_Score
    df_result = df[["Address", "Solar_Suitability_Score"]]

    # Save back to the same CSV (or a new one)
    df_result.to_csv("backend/data/solar_scores.csv", index=False)

    # Preview
    print(df_result.head())
