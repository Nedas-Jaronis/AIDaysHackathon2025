import matplotlib.pyplot as plt
from fastapi import HTTPException
import joblib
import pandas as pd
import matplotlib
matplotlib.use('Agg')


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
            elif 'lag' in col:
                lag_num = int(col[-1])
                prev_lag = col.replace(f'lag{lag_num}', f'lag{lag_num-1}')
                next_row.append(history[prev_lag].iloc[0])
            else:
                next_row.append(0)

        history = pd.DataFrame([next_row], columns=feature_cols)

    return pd.DataFrame(forecast_results)


def create_forecast_figure(state: str, years_ahead: int, csv_path='data/state_energy_summary.csv', models_path='models'):
    df = pd.read_csv(csv_path)
    df = df.sort_values(['State', 'Year'])

    clf = joblib.load(f'{models_path}/clf.joblib')
    reg_renew = joblib.load(f'{models_path}/reg_renew.joblib')
    reg_nonrenew = joblib.load(f'{models_path}/reg_nonrenew.joblib')
    models = {'clf': clf, 'reg_renew': reg_renew, 'reg_nonrenew': reg_nonrenew}

    # Prepare feature_cols per your existing logic (same as in plot_forecast)
    lags = 3
    df['Renewable_change'] = df.groupby('State')['PercentRenewable'].diff()
    df['NonRenewable_change'] = df.groupby(
        'State')['PercentNonRenewable'].diff()
    for lag in range(1, lags + 1):
        df[f'PercentRenewable_lag{lag}'] = df.groupby(
            'State')['PercentRenewable'].shift(lag)
        df[f'PercentNonRenewable_lag{lag}'] = df.groupby(
            'State')['PercentNonRenewable'].shift(lag)
        df[f'Renewable_change_lag{lag}'] = df.groupby(
            'State')['Renewable_change'].shift(lag)
        df[f'NonRenewable_change_lag{lag}'] = df.groupby(
            'State')['NonRenewable_change'].shift(lag)

    feature_cols = [
        'PercentRenewable', 'PercentNonRenewable', 'TotalEnergy',
        'Renewable_change', 'NonRenewable_change'
    ] + [f'PercentRenewable_lag{i}' for i in range(1, lags + 1)] + \
        [f'PercentNonRenewable_lag{i}' for i in range(1, lags + 1)] + \
        [f'Renewable_change_lag{i}' for i in range(1, lags + 1)] + \
        [f'NonRenewable_change_lag{i}' for i in range(1, lags + 1)]

    state_data = df[df['State'] == state]
    if state_data.empty:
        raise HTTPException(
            status_code=404, detail=f"No data found for state '{state}'")

    start_year = int(state_data['Year'].max())
    initial_row = state_data[state_data['Year'] == start_year].iloc[0]

    initial_features_df = initial_row[feature_cols].to_frame().T
    initial_features_df['TotalEnergy'] = initial_row['TotalEnergy']

    hist_years = state_data['Year']
    hist_percent_renewable = state_data['PercentRenewable']
    hist_percent_nonrenewable = state_data['PercentNonRenewable']

    forecast_df = multi_year_forecast(
        initial_features_df=initial_features_df,
        start_year=start_year,
        years_ahead=years_ahead,
        models=models,
        feature_cols=feature_cols,
        lags=lags
    )

    forecast_years = forecast_df['Year']
    forecast_percent_renewable = forecast_df['Pred_PercentRenewable']
    forecast_percent_nonrenewable = forecast_df['Pred_PercentNonRenewable']

    fig, ax = plt.subplots(figsize=(12, 6))
    ax.plot(hist_years, hist_percent_renewable,
            label='Historical Percent Renewable', color='blue')
    ax.plot(forecast_years, forecast_percent_renewable,
            label='Forecasted Percent Renewable', color='blue', linestyle='--')
    ax.plot(hist_years, hist_percent_nonrenewable,
            label='Historical Percent Nonrenewable', color='orange')
    ax.plot(forecast_years, forecast_percent_nonrenewable,
            label='Forecasted Percent Nonrenewable', color='orange', linestyle='--')

    ax.set_xlabel('Year')
    ax.set_ylabel('Percent Energy')
    ax.set_title(f'Energy Forecast for {state} ({years_ahead} Years Ahead)')
    ax.set_xlim(left=1960, right=2130)
    ax.legend()
    ax.grid(True)
    fig.tight_layout()

    return fig


def plot_forecast(state: str, years_ahead: int, csv_path='data/state_energy_summary.csv', models_path='models'):
    df = pd.read_csv(csv_path)
    df = df.sort_values(['State', 'Year'])

    clf = joblib.load(f'{models_path}/clf.joblib')
    reg_renew = joblib.load(f'{models_path}/reg_renew.joblib')
    reg_nonrenew = joblib.load(f'{models_path}/reg_nonrenew.joblib')
    models = {'clf': clf, 'reg_renew': reg_renew, 'reg_nonrenew': reg_nonrenew}

    df['Renewable_change'] = df.groupby('State')['PercentRenewable'].diff()
    df['NonRenewable_change'] = df.groupby(
        'State')['PercentNonRenewable'].diff()
    lags = 3
    for lag in range(1, lags + 1):
        df[f'PercentRenewable_lag{lag}'] = df.groupby(
            'State')['PercentRenewable'].shift(lag)
        df[f'PercentNonRenewable_lag{lag}'] = df.groupby(
            'State')['PercentNonRenewable'].shift(lag)
        df[f'Renewable_change_lag{lag}'] = df.groupby(
            'State')['Renewable_change'].shift(lag)
        df[f'NonRenewable_change_lag{lag}'] = df.groupby(
            'State')['NonRenewable_change'].shift(lag)

    feature_cols = [
        'PercentRenewable', 'PercentNonRenewable', 'TotalEnergy',
        'Renewable_change', 'NonRenewable_change'
    ] + [f'PercentRenewable_lag{i}' for i in range(1, lags + 1)] + \
        [f'PercentNonRenewable_lag{i}' for i in range(1, lags + 1)] + \
        [f'Renewable_change_lag{i}' for i in range(1, lags + 1)] + \
        [f'NonRenewable_change_lag{i}' for i in range(1, lags + 1)]

    state_data = df[df['State'] == state]
    if state_data.empty:
        raise ValueError(f"No data found for state '{state}'")

    start_year = int(state_data['Year'].max())
    initial_row = state_data[state_data['Year'] == start_year].iloc[0]

    initial_features_df = initial_row[feature_cols].to_frame().T
    initial_features_df['TotalEnergy'] = initial_row['TotalEnergy']

    hist_years = state_data['Year']
    hist_percent_renewable = state_data['PercentRenewable']
    hist_percent_nonrenewable = state_data['PercentNonRenewable']

    forecast_df = multi_year_forecast(
        initial_features_df=initial_features_df,
        start_year=start_year,
        years_ahead=years_ahead,
        models=models,
        feature_cols=feature_cols,
        lags=lags
    )

    forecast_years = forecast_df['Year']
    forecast_percent_renewable = forecast_df['Pred_PercentRenewable']
    forecast_percent_nonrenewable = forecast_df['Pred_PercentNonRenewable']

    plt.figure(figsize=(12, 6))
    plt.plot(hist_years, hist_percent_renewable,
             label='Historical Percent Renewable', color='blue')
    plt.plot(forecast_years, forecast_percent_renewable,
             label='Forecasted Percent Renewable', color='blue', linestyle='--')
    plt.plot(hist_years, hist_percent_nonrenewable,
             label='Historical Percent Nonrenewable', color='orange')
    plt.plot(forecast_years, forecast_percent_nonrenewable,
             label='Forecasted Percent Nonrenewable', color='orange', linestyle='--')

    plt.xlabel('Year')
    plt.ylabel('Percent Energy')
    plt.title(f'Energy Forecast for {state} ({years_ahead} Years Ahead)')
    plt.xlim(left=1960, right=2125)
    plt.legend()
    plt.grid(True)
    plt.tight_layout()
    plt.show()


if __name__ == "__main__":
    state_input = input("Enter state abbreviation (e.g., CA): ").upper()
    years_ahead_input = int(input("Enter years ahead to forecast (max 100): "))
    if not (1 <= years_ahead_input <= 100):
        raise ValueError("Years ahead must be between 1 and 100.")
    plot_forecast(state_input, years_ahead_input)
