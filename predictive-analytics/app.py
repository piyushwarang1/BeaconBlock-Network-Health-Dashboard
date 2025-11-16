import streamlit as st
import pandas as pd
import numpy as np
from statsmodels.tsa.arima.model import ARIMA
from sklearn.ensemble import IsolationForest
import plotly.graph_objects as go

# Simulate Polkadot network metrics (last 30 days, hourly)
dates = pd.date_range(start='2023-10-01', periods=720, freq='H')
np.random.seed(42)
block_time = 6 + np.random.normal(0, 0.5, 720) + 0.1 * np.sin(np.arange(720) * 2 * np.pi / 24)
validator_uptime = 98 + np.random.normal(0, 1, 720) - 0.5 * np.random.choice([0,1], 720, p=[0.95,0.05])
node_count = 1000 + np.cumsum(np.random.normal(0, 5, 720))
df = pd.DataFrame({'timestamp': dates, 'block_time': block_time, 'validator_uptime': validator_uptime, 'node_count': node_count})

# Anomaly detection using Isolation Forest
iso = IsolationForest(contamination=0.05, random_state=42)
df['anomaly'] = iso.fit_predict(df[['block_time', 'validator_uptime', 'node_count']]) == -1

# Time-series forecasting for block time (ARIMA)
model = ARIMA(df['block_time'], order=(5,1,0))
model_fit = model.fit()
forecast = model_fit.forecast(steps=24)
conf_int = model_fit.get_forecast(steps=24).conf_int()

# Streamlit app
st.title("Polkadot Network Health Predictive Analytics Prototype")
st.markdown("AI-driven forecasting for network issues using simulated data from Polkadot ecosystem.")

st.subheader("Historical Trends with Detected Anomalies")
fig1 = go.Figure()
fig1.add_trace(go.Scatter(x=df['timestamp'], y=df['block_time'], mode='lines', name='Block Time (s)'))
fig1.add_trace(go.Scatter(x=df[df['anomaly']]['timestamp'], y=df[df['anomaly']]['block_time'], mode='markers', name='Anomalies', marker=dict(color='red')))
st.plotly_chart(fig1)

st.subheader("24-Hour Forecast with Confidence Intervals")
future_dates = pd.date_range(start=df['timestamp'].iloc[-1] + pd.Timedelta(hours=1), periods=24, freq='H')
fig2 = go.Figure()
fig2.add_trace(go.Scatter(x=df['timestamp'], y=df['block_time'], mode='lines', name='Historical'))
fig2.add_trace(go.Scatter(x=future_dates, y=forecast, mode='lines', name='Forecast'))
fig2.add_trace(go.Scatter(x=future_dates, y=conf_int.iloc[:,0], fill=None, mode='lines', line_color='lightblue', name='Lower CI'))
fig2.add_trace(go.Scatter(x=future_dates, y=conf_int.iloc[:,1], fill='tonexty', mode='lines', line_color='lightblue', name='Upper CI'))
st.plotly_chart(fig2)

# Alerts for high-risk scenarios
if forecast.mean() > 6:
    st.error("🚨 Alert: Predicted block time may exceed 6 seconds - potential propagation delays!")
if df['validator_uptime'].tail(24).mean() < 95:
    st.warning("⚠️ Alert: Recent validator uptime below 95% - risk of downtime!")

st.markdown("""
**Notes:**
- Data simulated for prototyping; replace with real Polkadot Telemetry API fetches.
- Ties to Polkadot: Decentralized forecasting enhances network resilience and scalability by predicting issues before they impact parachains and XCM.
- Run: `pip install -r requirements.txt && streamlit run app.py`
""")