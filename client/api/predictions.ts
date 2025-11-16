import apiClient from '../src/lib/api';

export interface PredictionData {
  historical_plot: any;
  forecast_plot: any;
  alerts: string[];
  forecast_values: number[];
  confidence_intervals: number[][];
}

export const predictionsApi = {
  getPredictions: async (): Promise<PredictionData> => {
    const response = await apiClient.get('/predictions');
    return response.data;
  },
};