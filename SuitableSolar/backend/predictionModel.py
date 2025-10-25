import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
import joblib

# Load dataset
df = pd.read_csv('backend/data/state_energy_summary.csv')
df = df.sort_values(['State', 'Year'])

# Compute changes and lags
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

# Feature columns
feature_cols = [
    'PercentRenewable', 'PercentNonRenewable', 'TotalEnergy',
    'Renewable_change', 'NonRenewable_change'
] + [f'PercentRenewable_lag{i}' for i in range(1, lags+1)] + \
    [f'PercentNonRenewable_lag{i}' for i in range(1, lags+1)] + \
    [f'Renewable_change_lag{i}' for i in range(1, lags+1)] + \
    [f'NonRenewable_change_lag{i}' for i in range(1, lags+1)]

# Drop rows with missing values
df_model = df.dropna(subset=['IncreaseRenewable_future', 'PercentRenewable_future', 'PercentNonRenewable_future'] + feature_cols)

X = df_model[feature_cols]
y_class = df_model['IncreaseRenewable_future']
y_reg_renew = df_model['PercentRenewable_future']
y_reg_nonrenew = df_model['PercentNonRenewable_future']

# Train/test split by year
train_mask = df_model['Year'] <= 2015

X_train = X.loc[train_mask]
y_class_train = y_class.loc[train_mask]
y_reg_renew_train = y_reg_renew.loc[train_mask]
y_reg_nonrenew_train = y_reg_nonrenew.loc[train_mask]

# Train models
clf = RandomForestClassifier(n_estimators=200, max_depth=15, random_state=42)
clf.fit(X_train, y_class_train)

reg_renew = RandomForestRegressor(n_estimators=200, max_depth=15, random_state=42)
reg_renew.fit(X_train, y_reg_renew_train)

reg_nonrenew = RandomForestRegressor(n_estimators=200, max_depth=15, random_state=42)
reg_nonrenew.fit(X_train, y_reg_nonrenew_train)

# Save models
joblib.dump(clf, 'backend/models/clf.joblib')
joblib.dump(reg_renew, 'backend/models/reg_renew.joblib')
joblib.dump(reg_nonrenew, 'backend/models/reg_nonrenew.joblib')

print("Models trained and saved successfully.")
