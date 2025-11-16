import json
import pandas as pd
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
from sklearn.ensemble import IsolationForest
import plotly.graph_objects as go
from plotly.utils import PlotlyJSONEncoder

def predict(event, context):
    # Simulate Polkadot network metrics (last 30 days, hourly)
    dates = pd.date_range(start='2023-10-01', periods=720, freq='H')
    np.random.seed(42)
    block_time = 6 + np.random.normal(0, 0.5, 720) + 0.1 * np.sin(np.arange(720) * 2 * np.pi / 24)
    validator_uptime = 98 + np.random.normal(0, 1, 720) - 0.5 * np.random.choice([0,1], 720, p=[0.95,0.05])
    node_count = 1000 + np.cumsum(np.random.normal(0, 5, 720))
    df = pd.DataFrame({'timestamp': dates, 'block_time': block_time, 'validator_uptime': validator_uptime, 'node_count': node_count})

    # Anomaly detection
    iso = IsolationForest(contamination=0.05, random_state=42)
    df['anomaly'] = iso.fit_predict(df[['block_time', 'validator_uptime', 'node_count']]) == -1

    # Forecasting
    model = ARIMA(df['block_time'], order=(5,1,0))
    model_fit = model.fit()
    forecast = model_fit.forecast(steps=24)
    conf_int = model_fit.get_forecast(steps=24).conf_int()

    # Create plots
    future_dates = pd.date_range(start=df['timestamp'].iloc[-1] + pd.Timedelta(hours=1), periods=24, freq='H')

    fig1 = go.Figure()
    fig1.add_trace(go.Scatter(x=df['timestamp'], y=df['block_time'], mode='lines', name='Block Time'))
    fig1.add_trace(go.Scatter(x=df[df['anomaly']]['timestamp'], y=df[df['anomaly']]['block_time'], mode='markers', name='Anomalies', marker=dict(color='red')))

    fig2 = go.Figure()
    fig2.add_trace(go.Scatter(x=df['timestamp'], y=df['block_time'], mode='lines', name='Historical'))
    fig2.add_trace(go.Scatter(x=future_dates, y=forecast, mode='lines', name='Forecast'))
    fig2.add_trace(go.Scatter(x=future_dates, y=conf_int.iloc[:,0], fill=None, mode='lines', line_color='lightblue', name='Lower CI'))
    fig2.add_trace(go.Scatter(x=future_dates, y=conf_int.iloc[:,1], fill='tonexty', mode='lines', line_color='lightblue', name='Upper CI'))

    # Alerts
    alerts = []
    if forecast.mean() > 6:
        alerts.append("Predicted block time may exceed 6 seconds - potential propagation delays!")
    if df['validator_uptime'].tail(24).mean() < 95:
        alerts.append("Recent validator uptime below 95% - risk of downtime!")

    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'historical_plot': json.loads(json.dumps(fig1, cls=PlotlyJSONEncoder)),
            'forecast_plot': json.loads(json.dumps(fig2, cls=PlotlyJSONEncoder)),
            'alerts': alerts,
            'forecast_values': forecast.tolist(),
            'confidence_intervals': conf_int.values.tolist()
        })
    }