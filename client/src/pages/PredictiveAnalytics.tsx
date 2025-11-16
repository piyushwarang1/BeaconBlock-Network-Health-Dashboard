import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Loading } from '../components/ui/Loading';
import { Button } from '../components/ui/Button';
import { TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';
import Plot from 'react-plotly.js';
import { predictionsApi } from '../../api/predictions';
import { sentimentApi } from '../../api/sentiment';

export default function PredictiveAnalytics() {
  // Fetch predictions with auto-refresh every 2 minutes
  const { data: predictionData, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['predictions'],
    queryFn: () => predictionsApi.getPredictions(),
    refetchInterval: 120000, // Refetch every 2 minutes
    staleTime: 60000, // Consider data stale after 1 minute
  });

  // Fetch sentiment data
  const { data: sentimentData, isLoading: sentimentLoading, error: sentimentError } = useQuery({
    queryKey: ['sentiment'],
    queryFn: () => sentimentApi.getSentiment(),
    refetchInterval: 120000,
    staleTime: 60000,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Predictive Analytics</h1>
          <p className="text-muted-foreground mt-1">
            AI-driven forecasting for Polkadot network health issues
            {isRefetching && <span className="ml-2 text-blue-500">• Updating...</span>}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading || isRefetching}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Network Health Forecasting
          </CardTitle>
          <CardDescription>
            Machine learning predictions for validator downtime, block propagation delays, and throughput spikes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Forecast Horizon</p>
              </div>
              <p className="text-2xl font-bold">24 Hours</p>
              <p className="text-xs text-muted-foreground mt-1">
                Next 24 hours predictions
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Anomaly Detection</p>
              </div>
              <p className="text-2xl font-bold">Isolation Forest</p>
              <p className="text-xs text-muted-foreground mt-1">
                ML-based outlier detection
              </p>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Model Type</p>
              </div>
              <p className="text-2xl font-bold">ARIMA</p>
              <p className="text-xs text-muted-foreground mt-1">
                Time-series forecasting
              </p>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800 dark:text-green-200">Live Data Integration</h4>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Connected to Polkadot mainnet via Polkadot.js API. Real-time block data and validator statistics power these AI predictions.
                  Data refreshes automatically every 2 minutes.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sentiment Overlay */}
      <Card>
        <CardHeader>
          <CardTitle>Community Sentiment Overlay</CardTitle>
          <CardDescription>
            NLP analysis of sentiment from X, GitHub, and forums correlated with network metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sentimentLoading ? (
            <div className="h-[400px] flex items-center justify-center">
              <Loading text="Loading sentiment data..." />
            </div>
          ) : sentimentError ? (
            <div className="h-[400px] flex items-center justify-center text-red-500">
              Error loading sentiment: {sentimentError.message}
            </div>
          ) : sentimentData ? (
            <div className="space-y-6">
              {/* Timeline Plot */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Sentiment Timeline with Block Time Correlation</h3>
                <div className="h-[400px]">
                  <Plot
                    data={sentimentData.timeline_plot.data}
                    layout={{ ...sentimentData.timeline_plot.layout, height: 400 }}
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
              </div>

              {/* Heatmap */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Sentiment by Topic</h3>
                <div className="h-[400px]">
                  <Plot
                    data={sentimentData.heatmap_plot.data}
                    layout={{ ...sentimentData.heatmap_plot.layout, height: 400 }}
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
              </div>

              {/* Alerts */}
              {sentimentData.alerts.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Sentiment Alerts</h3>
                  {sentimentData.alerts.map((alert, index) => (
                    <div key={index} className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                        <p className="text-sm text-red-700 dark:text-red-300">{alert}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Predictions Display */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Forecasting Dashboard</CardTitle>
          <CardDescription>
            Live predictions and anomaly detection for Polkadot network metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[600px] flex items-center justify-center">
              <Loading text="Loading predictions..." />
            </div>
          ) : error ? (
            <div className="h-[600px] flex items-center justify-center text-red-500">
              Error loading predictions: {error.message}
            </div>
          ) : predictionData ? (
            <div className="space-y-6">
              {/* Historical Plot */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Historical Trends with Anomalies</h3>
                <div className="h-[400px]">
                  <Plot
                    data={predictionData.historical_plot.data}
                    layout={{ ...predictionData.historical_plot.layout, height: 400 }}
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
              </div>

              {/* Forecast Plot */}
              <div>
                <h3 className="text-lg font-semibold mb-2">24-Hour Forecast</h3>
                <div className="h-[400px]">
                  <Plot
                    data={predictionData.forecast_plot.data}
                    layout={{ ...predictionData.forecast_plot.layout, height: 400 }}
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
              </div>

              {/* Alerts */}
              {predictionData.alerts.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Alerts</h3>
                  {predictionData.alerts.map((alert, index) => (
                    <div key={index} className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                        <p className="text-sm text-red-700 dark:text-red-300">{alert}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}