import { Router } from 'express';
import { Logger } from 'winston';

export const sentimentRoutes = (logger: Logger) => {
  const router = Router();

  router.get('/', async (req, res) => {
    try {
      logger.info('Generating sentiment analysis...');

      // Mock data
      const dates = Array.from({length: 30}, (_, i) => {
        const date = new Date('2023-10-01');
        date.setDate(date.getDate() + i);
        return date.toISOString().split('T')[0];
      });

      const topics = ['staking', 'upgrades', 'governance', 'parachains'];

      // Mock sentiment scores (-1 to 1)
      const sentimentScores = Array.from({length: 30}, () => (Math.random() - 0.5) * 2);

      // Mock block times
      const blockTimes = Array.from({length: 30}, () => 6 + (Math.random() - 0.5));

      // Topic sentiment
      const topicSentiment = topics.map(topic => ({
        topic,
        sentiment: (Math.random() - 0.5) * 2
      }));

      // Timeline plot
      const timelinePlot = {
        data: [{
          x: dates,
          y: sentimentScores,
          type: 'scatter',
          mode: 'lines+markers',
          name: 'Avg Sentiment',
          line: { color: '#3b82f6' }
        }, {
          x: dates,
          y: blockTimes,
          type: 'scatter',
          mode: 'lines',
          name: 'Block Time (s)',
          yaxis: 'y2',
          line: { color: '#10b981' }
        }],
        layout: {
          title: { text: 'Sentiment Timeline with Block Time Correlation', font: { color: 'white' } },
          paper_bgcolor: 'black',
          plot_bgcolor: 'black',
          xaxis: { gridcolor: '#374151', linecolor: '#6b7280', tickcolor: '#6b7280', tickfont: { color: 'white' } },
          yaxis: { gridcolor: '#374151', linecolor: '#6b7280', tickcolor: '#6b7280', tickfont: { color: 'white' }, title: 'Sentiment Score' },
          yaxis2: { title: 'Block Time', overlaying: 'y', side: 'right', tickfont: { color: 'white' } },
          legend: { font: { color: 'white' } }
        }
      };

      // Heatmap (bar chart)
      const heatmapPlot = {
        data: [{
          x: topicSentiment.map(t => t.topic),
          y: topicSentiment.map(t => t.sentiment),
          type: 'bar',
          marker: { color: '#3b82f6' }
        }],
        layout: {
          title: { text: 'Sentiment by Topic', font: { color: 'white' } },
          paper_bgcolor: 'black',
          plot_bgcolor: 'black',
          xaxis: { gridcolor: '#374151', linecolor: '#6b7280', tickcolor: '#6b7280', tickfont: { color: 'white' } },
          yaxis: { gridcolor: '#374151', linecolor: '#6b7280', tickcolor: '#6b7280', tickfont: { color: 'white' } }
        }
      };

      // Alerts
      const avgSentiment = sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length;
      const alerts = [];
      if (avgSentiment < -0.2) {
        alerts.push("High negative sentiment detected - potential community dissatisfaction!");
      }

      res.json({
        timeline_plot: timelinePlot,
        heatmap_plot: heatmapPlot,
        alerts
      });

    } catch (error) {
      logger.error('Error generating sentiment:', error);
      res.status(500).json({ error: 'Failed to generate sentiment analysis' });
    }
  });

  return router;
};