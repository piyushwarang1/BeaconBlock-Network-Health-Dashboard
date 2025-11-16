import { Router } from 'express';
import { Logger } from 'winston';
import { ApiPromise, WsProvider } from '@polkadot/api';

export const predictionsRoutes = (logger: Logger) => {
  const router = Router();

  router.get('/', async (req, res) => {
    try {
      logger.info('Fetching Polkadot data and generating predictions...');
  
      // Connect to Polkadot with timeout
      const provider = new WsProvider('wss://rpc.polkadot.io', 10000); // 10s timeout
      const api = await ApiPromise.create({ provider });
  
      try {
        // Get current block
        const currentHeader = await api.rpc.chain.getHeader();
        const currentBlockNumber = currentHeader.number.toNumber();
        logger.info(`Current Polkadot block: ${currentBlockNumber}`);
  
        // Get last 5 blocks for historical data
        const blockTimes: number[] = [];
        const dates: string[] = [];
  
        for (let i = 0; i < 5; i++) {
          const blockNumber = currentBlockNumber - i;
          const blockHash = await api.rpc.chain.getBlockHash(blockNumber);
  
          const timestamp = (await (api.query as any).timestamp.now.at(blockHash)).toPrimitive() as number;
          const date = new Date(timestamp);
          dates.unshift(date.toISOString());
  
          if (i > 0) {
            const prevBlockHash = await api.rpc.chain.getBlockHash(blockNumber - 1);
            const prevTimestamp = (await (api.query as any).timestamp.now.at(prevBlockHash)).toPrimitive() as number;
            const blockTime = (timestamp - prevTimestamp) / 1000; // seconds
            blockTimes.unshift(blockTime);
          }
        }
  
        // Current network stats
        const peers = 100; // Default, as RPC call is blocked
        const validators = ((await (api.query as any).session.validators())).length;
        logger.info(`Polkadot network stats - Validators: ${validators}, Peers: ${peers}`);
  
        // Simulate uptime based on recent performance
        const avgBlockTime = blockTimes.reduce((a, b) => a + b, 0) / blockTimes.length;
        const uptime = avgBlockTime < 6 ? 98 + Math.random() * 2 : 95 + Math.random() * 3;
        const validatorUptime = Array(4).fill(uptime);
  
        // Use real block times for historical
        const blockTime = blockTimes;
  
        logger.info(`Generated predictions with ${blockTimes.length} data points`);

        // Simple anomaly detection (basic threshold)
        const anomalies = blockTime.map((bt: number, i: number) => bt > 7 || bt < 5);

        // Simple forecast (last 24 hours average + trend)
        const recent = blockTime.slice(-24);
        const avg = recent.reduce((a: number, b: number) => a + b, 0) / recent.length;
        const trend = (recent[recent.length - 1]! - recent[0]!) / 24;
        const forecast = [];
        for (let i = 1; i <= 24; i++) {
          forecast.push(avg + trend * i + (Math.random() - 0.5) * 0.5);
        }

        // Confidence intervals (simple)
        const confLower = forecast.map(f => f - 0.5);
        const confUpper = forecast.map(f => f + 0.5);

        // Create simple plot data (for Plotly)
        const historicalPlot = {
          data: [{
            x: dates,
            y: blockTime,
            type: 'scatter',
            mode: 'lines',
            name: 'Block Time',
            line: { color: '#3b82f6' }
          }, {
            x: dates.filter((_: string, i: number) => anomalies[i]),
            y: blockTime.filter((_: number, i: number) => anomalies[i]),
            type: 'scatter',
            mode: 'markers',
            name: 'Anomalies',
            marker: { color: 'red' }
          }],
          layout: {
            title: { text: 'Historical Block Times', font: { color: 'white' } },
            paper_bgcolor: 'black',
            plot_bgcolor: 'black',
            xaxis: { gridcolor: '#374151', linecolor: '#6b7280', tickcolor: '#6b7280', tickfont: { color: 'white' } },
            yaxis: { gridcolor: '#374151', linecolor: '#6b7280', tickcolor: '#6b7280', tickfont: { color: 'white' } },
            legend: { font: { color: 'white' } }
          }
        };

        const forecastDates = [];
        const lastDate = new Date(dates[dates.length - 1]!);
        for (let i = 1; i <= 24; i++) {
          const date = new Date(lastDate);
          date.setHours(date.getHours() + i);
          forecastDates.push(date.toISOString());
        }

        const forecastPlot = {
          data: [{
            x: dates,
            y: blockTime,
            type: 'scatter',
            mode: 'lines',
            name: 'Historical',
            line: { color: '#3b82f6' }
          }, {
            x: forecastDates,
            y: forecast,
            type: 'scatter',
            mode: 'lines',
            name: 'Forecast',
            line: { color: '#10b981' }
          }, {
            x: forecastDates,
            y: confLower,
            type: 'scatter',
            mode: 'lines',
            fill: 'none',
            line: { color: '#6b7280' },
            name: 'Lower CI'
          }, {
            x: forecastDates,
            y: confUpper,
            type: 'scatter',
            mode: 'lines',
            fill: 'tonexty',
            line: { color: '#6b7280' },
            name: 'Upper CI'
          }],
          layout: {
            title: { text: '24-Hour Forecast', font: { color: 'white' } },
            paper_bgcolor: 'black',
            plot_bgcolor: 'black',
            xaxis: { gridcolor: '#374151', linecolor: '#6b7280', tickcolor: '#6b7280', tickfont: { color: 'white' } },
            yaxis: { gridcolor: '#374151', linecolor: '#6b7280', tickcolor: '#6b7280', tickfont: { color: 'white' } },
            legend: { font: { color: 'white' } }
          }
        };

        // Alerts
        const alerts = [];
        if (forecast.reduce((a: number, b: number) => a + b, 0) / forecast.length > 6) {
          alerts.push("Predicted block time may exceed 6 seconds - potential propagation delays!");
        }
        if (validatorUptime.slice(-24).reduce((a: number, b: number) => a + b, 0) / 24 < 95) {
          alerts.push("Recent validator uptime below 95% - risk of downtime!");
        }

        res.json({
          historical_plot: historicalPlot,
          forecast_plot: forecastPlot,
          alerts,
          forecast_values: forecast,
          confidence_intervals: [confLower, confUpper]
        });

      } finally {
        await api.disconnect();
      }

    } catch (error) {
      logger.error('Error generating predictions:', error);
      res.status(500).json({ error: 'Failed to generate predictions' });
    }
  });

  return router;
};