import pandas as pd

# Path to Excel file
filepath = "backend/data/EnergySourcesByState.xlsx"

# Sheet names for each fuel
sheets = ['Coal', 'Natural gas', 'Petroleum', 'Nuclear', 'Total renewable energy']

# Dictionary to hold processed DataFrames
fuel_dfs = {}

for sheet in sheets:
    # Read sheet, skip the first 2 rows (so headers start correctly)
    df = pd.read_excel(filepath, sheet_name=sheet, skiprows=2)
    
    # Rename first column to "State"
    df.rename(columns={df.columns[0]: 'State'}, inplace=True)
    
    # Convert from wide to long format: year, consumption
    df_long = df.melt(id_vars=['State'], var_name='Year', value_name=sheet)
    
    # Convert Year to int and consumption to float (remove commas if any)
    df_long['Year'] = df_long['Year'].astype(int)
    df_long[sheet] = df_long[sheet].astype(str).str.replace(',', '')
    df_long[sheet] = pd.to_numeric(df_long[sheet], errors='coerce')
    
    fuel_dfs[sheet] = df_long

# Merge all fuels on State and Year
from functools import reduce
dfs = list(fuel_dfs.values())
energy_data = reduce(lambda left, right: pd.merge(left, right, on=['State', 'Year']), dfs)

# Optional: compute TotalEnergy and PercentRenewable, PercentNonRenewable columns if needed
energy_data['TotalEnergy'] = energy_data[['Coal', 'Natural gas', 'Petroleum', 'Nuclear', 'Total renewable energy']].sum(axis=1)
energy_data['PercentRenewable'] = 100 * energy_data['Total renewable energy'] / energy_data['TotalEnergy']
energy_data['PercentNonRenewable'] = 100 * (energy_data['Coal'] + energy_data['Natural gas'] + energy_data['Petroleum'] + energy_data['Nuclear']) / energy_data['TotalEnergy']

# Save the processed data to CSV
energy_data.to_csv('backend/data/state_energy_summary.csv', index=False)

# Optional: print a sample
print(energy_data.head())
