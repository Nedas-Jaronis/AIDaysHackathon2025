import pandas as pd
import json


def load_data(filepath: str) -> pd.DataFrame:
    df = pd.read_csv(filepath)
    df.columns = [col.strip() for col in df.columns]
    return df


def prepare_heatmap_data(df: pd.DataFrame, year: int):
    df_year = df[df['Year'] == year].dropna(
        subset=['PercentRenewable', 'PercentNonRenewable'])

    renewable = df_year.set_index('State')['PercentRenewable'].to_dict()
    non_renewable = df_year.set_index('State')['PercentNonRenewable'].to_dict()

    return renewable, non_renewable


def save_heatmap_json(data: dict, output_file: str):
    with open(output_file, 'w') as f:
        json.dump(data, f)


if __name__ == "__main__":
    data_path = "backend/data/state_energy_summary.csv"
    df = load_data(data_path)

    year = 2023

    renewable_data, non_renewable_data = prepare_heatmap_data(df, year)

    save_heatmap_json(
        renewable_data, f"public/heatmap_percent_renewable_{year}.json")
    save_heatmap_json(non_renewable_data,
                      f"public/heatmap_percent_nonrenewable_{year}.json")

    print(f"Saved heatmap JSON files for year {year}:")
    print(f"  - Percent Renewable: heatmap_percent_renewable_{year}.json")
    print(
        f"  - Percent Non-Renewable: heatmap_percent_nonrenewable_{year}.json")
