import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import accuracy_score, mean_squared_error


def multi_year_forecast(initial_features_df, years_ahead, models, feature_cols, lags=3):
    clf = models['clf']
    reg_renew = models['reg_renew']
    reg_nonrenew = models['reg_nonrenew']
    
    history = initial_features_df[feature_cols].copy()
    current_year = int(initial_features_df['Year'].iloc[0])
    current_total_energy = initial_features_df['TotalEnergy'].iloc[0]
    
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

        next_features = {}
        next_features['PercentRenewable'] = pred_renew
        next_features['PercentNonRenewable'] = pred_nonrenew
        next_features['TotalEnergy'] = current_total_energy
        next_features['Renewable_change'] = pred_renew - history['PercentRenewable'].iloc[0]
        next_features['NonRenewable_change'] = pred_nonrenew - history['PercentNonRenewable'].iloc[0]

        for lag in range(lags, 1, -1):
            next_features[f'PercentRenewable_lag{lag}'] = history[f'PercentRenewable_lag{lag-1}'].iloc[0]
            next_features[f'PercentNonRenewable_lag{lag}'] = history[f'PercentNonRenewable_lag{lag-1}'].iloc[0]
            next_features[f'Renewable_change_lag{lag}'] = history[f'Renewable_change_lag{lag-1}'].iloc[0]
            next_features[f'NonRenewable_change_lag{lag}'] = history[f'NonRenewable_change_lag{lag-1}'].iloc[0]

        next_features['PercentRenewable_lag1'] = history['PercentRenewable'].iloc[0]
        next_features['PercentNonRenewable_lag1'] = history['PercentNonRenewable'].iloc[0]
        next_features['Renewable_change_lag1'] = next_features['Renewable_change']
        next_features['NonRenewable_change_lag1'] = next_features['NonRenewable_change']

        history = pd.DataFrame([next_features], columns=feature_cols)

    return pd.DataFrame(forecast_results)




def input_state(states_list):
    while True:
        state_input = input("Enter state abbreviation (e.g., CA): ").upper()
        if state_input in states_list:
            return state_input
        else:
            print(f"Invalid input. Please enter a valid US state abbreviation from the list: {', '.join(states_list)}")


def input_years():
    while True:
        years_input = input("Enter years ahead to forecast (positive integer): ")
        if years_input.isdigit() and int(years_input) > 0:
            return int(years_input)
        else:
            print("Invalid input. Please enter a positive integer.")


if __name__ == "__main__":
    # Load and prepare dataset
    df = pd.read_csv('backend/data/state_energy_summary.csv')
    df = df.sort_values(['State', 'Year'])

    df['Renewable_change'] = df.groupby('State')['PercentRenewable'].diff()
    df['NonRenewable_change'] = df.groupby('State')['PercentNonRenewable'].diff()

    lags = 3
    for lag in range(1, lags+1):
        df[f'PercentRenewable_lag{lag}'] = df.groupby('State')['PercentRenewable'].shift(lag)
        df[f'PercentNonRenewable_lag{lag}'] = df.groupby('State')['PercentNonRenewable'].shift(lag)
        df[f'Renewable_change_lag{lag}'] = df.groupby('State')['Renewable_change'].shift(lag)
        df[f'NonRenewable_change_lag{lag}'] = df.groupby('State')['NonRenewable_change'].shift(lag)

    df['IncreaseRenewable'] = (df['Renewable_change'] > df['NonRenewable_change']).astype(int)
    forecast_horizon = 1
    df['IncreaseRenewable_future'] = df.groupby('State')['IncreaseRenewable'].shift(-forecast_horizon)
    df['PercentRenewable_future'] = df.groupby('State')['PercentRenewable'].shift(-forecast_horizon)
    df['PercentNonRenewable_future'] = df.groupby('State')['PercentNonRenewable'].shift(-forecast_horizon)

    feature_cols = [
        'PercentRenewable', 'PercentNonRenewable', 'TotalEnergy',
        'Renewable_change', 'NonRenewable_change'
    ] + [f'PercentRenewable_lag{i}' for i in range(1, lags+1)] + \
        [f'PercentNonRenewable_lag{i}' for i in range(1, lags+1)] + \
        [f'Renewable_change_lag{i}' for i in range(1, lags+1)] + \
        [f'NonRenewable_change_lag{i}' for i in range(1, lags+1)]

    df_model = df.dropna(subset=['IncreaseRenewable_future', 'PercentRenewable_future', 'PercentNonRenewable_future'] + feature_cols)

    X = df_model[feature_cols]
    y_class = df_model['IncreaseRenewable_future']
    y_reg_renew = df_model['PercentRenewable_future']
    y_reg_nonrenew = df_model['PercentNonRenewable_future']

    train_mask = df_model['Year'] <= 2015
    test_mask = df_model['Year'] > 2015

    X_train, X_test = X.loc[train_mask], X.loc[test_mask]
    y_class_train, y_class_test = y_class.loc[train_mask], y_class.loc[test_mask]
    y_reg_renew_train, y_reg_renew_test = y_reg_renew.loc[train_mask], y_reg_renew.loc[test_mask]
    y_reg_nonrenew_train, y_reg_nonrenew_test = y_reg_nonrenew.loc[train_mask], y_reg_nonrenew.loc[test_mask]

    clf = RandomForestClassifier(n_estimators=200, max_depth=15, random_state=42)
    clf.fit(X_train, y_class_train)

    reg_renew = RandomForestRegressor(n_estimators=200, max_depth=15, random_state=42)
    reg_renew.fit(X_train, y_reg_renew_train)

    reg_nonrenew = RandomForestRegressor(n_estimators=200, max_depth=15, random_state=42)
    reg_nonrenew.fit(X_train, y_reg_nonrenew_train)

    # Valid US states in the dataframe
    valid_states = df_model['State'].unique()

    # Get user inputs safely
    state = input_state(valid_states)
    years_ahead = input_years()

    latest_row = df_model[df_model['State'] == state].sort_values('Year').iloc[-1]
    initial_features_df = latest_row[feature_cols + ['Year', 'TotalEnergy']].to_frame().T

    models = {'clf': clf, 'reg_renew': reg_renew, 'reg_nonrenew': reg_nonrenew}

    forecast_df = multi_year_forecast(initial_features_df, years_ahead, models, feature_cols, lags=3)

    print(f"\nForecast for {state} for next {years_ahead} years:")
    print(forecast_df)
