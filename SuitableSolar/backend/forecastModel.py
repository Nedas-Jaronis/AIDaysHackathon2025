import pandas as pd
import joblib


def multi_year_forecast(initial_features_df, start_year, years_ahead, models, feature_cols, lags=3):
    clf = models['clf']
    reg_renew = models['reg_renew']
    reg_nonrenew = models['reg_nonrenew']

    current_year = start_year
    history = initial_features_df.copy().reset_index(drop=True)

    forecast_results = []

    for _ in range(years_ahead):
        pred_class = clf.predict(history)[0]
        pred_renew = reg_renew.predict(history)[0]
        pred_nonrenew = reg_nonrenew.predict(history)[0]

        current_year += 1
        forecast_results.append({
            'Year': current_year,
            'Pred_IncreaseRenewable': pred_class,
            'Pred_PercentRenewable': pred_renew,
            'Pred_PercentNonRenewable': pred_nonrenew
        })

        # Build next row for features
        next_row = []
        for col in feature_cols:
            if col == 'PercentRenewable':
                next_row.append(pred_renew)
            elif col == 'PercentNonRenewable':
                next_row.append(pred_nonrenew)
            elif col == 'TotalEnergy':
                next_row.append(history['TotalEnergy'].iloc[0])
            elif col == 'Renewable_change':
                next_row.append(
                    pred_renew - history['PercentRenewable'].iloc[0])
            elif col == 'NonRenewable_change':
                next_row.append(
                    pred_nonrenew - history['PercentNonRenewable'].iloc[0])
            elif col.endswith('lag1'):
                base_col = col.replace('_lag1', '')
                next_row.append(history[base_col].iloc[0])
            elif 'lag' in col:  # lag2 or lag3
                lag_num = int(col[-1])
                prev_lag = col.replace(f'lag{lag_num}', f'lag{lag_num-1}')
                next_row.append(history[prev_lag].iloc[0])
            else:
                next_row.append(0)  # fallback

        history = pd.DataFrame([next_row], columns=feature_cols)

    return pd.DataFrame(forecast_results)


# --- Load saved models ---
clf = joblib.load('models/clf.joblib')
reg_renew = joblib.load('models/reg_renew.joblib')
reg_nonrenew = joblib.load('models/reg_nonrenew.joblib')
models = {'clf': clf, 'reg_renew': reg_renew, 'reg_nonrenew': reg_nonrenew}

# --- Load dataset ---
df = pd.read_csv('data/state_energy_summary.csv')
df = df.sort_values(['State', 'Year'])

# --- Compute changes and lags ---
df['Renewable_change'] = df.groupby('State')['PercentRenewable'].diff()
df['NonRenewable_change'] = df.groupby('State')['PercentNonRenewable'].diff()

lags = 3
for lag in range(1, lags+1):
    df[f'PercentRenewable_lag{lag}'] = df.groupby(
        'State')['PercentRenewable'].shift(lag)
    df[f'PercentNonRenewable_lag{lag}'] = df.groupby(
        'State')['PercentNonRenewable'].shift(lag)
    df[f'Renewable_change_lag{lag}'] = df.groupby(
        'State')['Renewable_change'].shift(lag)
    df[f'NonRenewable_change_lag{lag}'] = df.groupby(
        'State')['NonRenewable_change'].shift(lag)

# --- Define feature columns ---
feature_cols = [
    'PercentRenewable', 'PercentNonRenewable', 'TotalEnergy',
    'Renewable_change', 'NonRenewable_change'
] + [f'PercentRenewable_lag{i}' for i in range(1, lags+1)] + \
    [f'PercentNonRenewable_lag{i}' for i in range(1, lags+1)] + \
    [f'Renewable_change_lag{i}' for i in range(1, lags+1)] + \
    [f'NonRenewable_change_lag{i}' for i in range(1, lags+1)]

# --- User input ---
state = input("Enter state abbreviation (e.g., CA): ").upper()
years_ahead = int(input("Enter years ahead to forecast: "))

# --- Prepare initial features for the selected state ---
latest_row = df[df['State'] == state].sort_values('Year').iloc[-1]

initial_features_df = latest_row[feature_cols].to_frame().T
initial_features_df['TotalEnergy'] = latest_row['TotalEnergy']
current_year = int(latest_row['Year'])

# --- Run forecast ---
forecast_df = multi_year_forecast(
    initial_features_df=initial_features_df,
    start_year=current_year,
    years_ahead=years_ahead,
    models=models,
    feature_cols=feature_cols,
    lags=lags
)

# --- Compute predicted averages ---
avg_percent_renewable = forecast_df['Pred_PercentRenewable'].mean()
predicted_increase = avg_percent_renewable - \
    initial_features_df['PercentRenewable'].iloc[0]

print(
    f"\nCurrent percent renewable: {initial_features_df['PercentRenewable'].iloc[0]:.2f}%")
print(
    f"Predicted average percent renewable over next {years_ahead} years: {avg_percent_renewable:.2f}%")
print(
    f"Predicted average increase in renewable over next {years_ahead} years: {predicted_increase:.2f}%")
