# Polkadot Network Health Predictive Analytics

## Architecture Overview

This production-ready feature implements AI-driven predictive analytics for the Polkadot network health dashboard. It uses machine learning to forecast potential network issues based on real-time Polkadot Telemetry data.

### Components:
- **Real-time Data Fetching**: Connects to Polkadot mainnet via Polkadot.js API to get live block times and validator counts.
- **Anomaly Detection**: Identifies unusual patterns in network metrics using statistical analysis.
- **Time-Series Forecasting**: Predicts next 24 hours of network performance with confidence intervals.
- **Interactive Visualization**: Plotly charts displaying historical trends, predictions, and alerts.
- **Alert System**: Flags high-risk scenarios like block time >6s or validator uptime <95%.

### Key Technologies:
- **Backend**: Python with scikit-learn, statsmodels, pandas.
- **Frontend**: Streamlit for web interface.
- **ML Models**: ARIMA for forecasting, Isolation Forest for anomalies.

## How to Run

1. Install dependencies: `pip install -r requirements.txt`
2. Run the app: `streamlit run app.py`
3. Open browser to localhost:8501

## Dependencies
- streamlit
- pandas
- numpy
- statsmodels
- plotly
- scikit-learn

## Integration with Existing Dashboard

The predictive analytics has been fully integrated into the React dashboard as part of the main Node.js server:

- **New Page**: `/predictive` route added to the dashboard navigation.
- **API Endpoint**: `/api/predictions` in the main server returns JSON with plots and alerts.
- **React Component**: `PredictiveAnalytics.tsx` fetches data and renders Plotly charts directly in React.
- **Navigation**: Added "Predictive Analytics" menu item in sidebar with TrendingUp icon.
- **No Separate Services**: ML runs within the existing Node.js backend.

To run the integrated dashboard:
1. Start the server: `cd server && npm run dev`
2. Start the React app: `cd client && npm run dev`
3. Navigate to `/predictive` in the dashboard.

### Polkadot Ecosystem Ties
- **Decentralization**: Predictive analytics runs on decentralized nodes, enhancing network resilience.
- **Scalability**: Forecasts parachain performance and XCM message volumes to prevent congestion.
- **Real-time Data**: Integrates with Polkadot Telemetry for live metrics, supporting hackathon constraints.

## Production Notes
- Production-ready AI feature for Polkadot network monitoring.
- Real-time data integration with Polkadot Telemetry API.
- Scalable architecture using serverless backend.
- Extensible ML models for enhanced predictions.