import pandas as pd

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
                next_row.append(pred_renew - history['PercentRenewable'].iloc[0])
            elif col == 'NonRenewable_change':
                next_row.append(pred_nonrenew - history['PercentNonRenewable'].iloc[0])
            elif col == 'PercentRenewable_lag1':
                next_row.append(history['PercentRenewable'].iloc[0])
            elif col == 'PercentNonRenewable_lag1':
                next_row.append(history['PercentNonRenewable'].iloc[0])
            elif col == 'Renewable_change_lag1':
                next_row.append(pred_renew - history['PercentRenewable'].iloc[0])
            elif col == 'NonRenewable_change_lag1':
                next_row.append(pred_nonrenew - history['PercentNonRenewable'].iloc[0])
            elif 'lag2' in col or 'lag3' in col:
                lag_num = int(col[-1])
                prev_lag = col.replace(f'lag{lag_num}', f'lag{lag_num-1}')
                next_row.append(history[prev_lag].iloc[0])
            else:
                next_row.append(0)

        history = pd.DataFrame([next_row], columns=feature_cols)
        history['TotalEnergy'] = history['TotalEnergy'].iloc[0]

    return pd.DataFrame(forecast_results)
