# Fetch data from https://api.eia.gov/

import argparse
import os
import requests
import pandas as pd
from dotenv import load_dotenv

def fetch_eia_retail_price(api_key: str, state: str) -> pd.DataFrame:
    """
    Fetches retail electricity price (and optionally other fields) from the EIA API v2.
    
    Parameters:
      api_key       : Your EIA API key (string)
      state         : Two-letter state code (e.g., "FL")
    
    Returns:
      A pandas DataFrame with the returned data.
    """

    # Parameters
    sector: str = "ALL",
    start: str = "2020-01",
    end: str = "2025-08",
    frequency: str = "monthly",
    data_fields: list = "price",
    sort_column: str = "period",
    sort_direction: str = "desc",
    offset: int = 0,
    length: int = 5000

    if data_fields is None:
        data_fields = "price"
    
    base_url = "https://api.eia.gov/v2/electricity/retail-sales/data/"
    
    # Build query parameters
    params = {
        "api_key": api_key,
        "frequency": frequency,
        "start": start,
        "end": end, 
        f"facets[stateid][]": state,
        f"facets[sectorid][]": sector,
        f"sort[0][column]": sort_column,
        f"sort[0][direction]": sort_direction,
        "offset": offset,
        "length": length
    }
    
    # Add the data fields with the correct format data[0]=..., data[1]=..., etc
    for i, field in enumerate(data_fields):
        params[f"data[{i}]"] = field
    
    # Send request
    response = requests.get(base_url, params=params)
    response.raise_for_status()
    json_data = response.json()
    
    # Parse data into DataFrame
    # According to docs, data is in json_data["response"]["data"]  :contentReference[oaicite:1]{index=1}
    data_list = json_data.get("response", {}).get("data", [])
    df = pd.DataFrame(data_list)
    
    return df

def clean_data(df):
    # Cleans the data so that it accurately reflects the price
    df["price"] = pd.to_numeric(df["price"], errors="coerce")  # Make column numeric

    df["price"] = df["price"] / 100
    df.drop("price-units", inplace=True, axis=1)
    df.to_csv("data/electricity.csv", mode="w")

def main():
    parser = argparse.ArgumentParser(description="Gets electricity cost from Jan 2020 to Aug 2025")
    parser.add_argument("--state", type=str, help="2 letter abbreviation of state.")

    args = parser.parse_args()

    load_dotenv()
    API_KEY = os.getenv("API_KEY")
    
    df = fetch_eia_retail_price(API_KEY, args.state)
    clean_data(df)

if __name__ == "__main__":
    main()