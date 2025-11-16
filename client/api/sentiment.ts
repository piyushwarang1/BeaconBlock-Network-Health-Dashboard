import apiClient from '../src/lib/api';

export interface SentimentData {
  timeline_plot: any;
  heatmap_plot: any;
  alerts: string[];
}

export const sentimentApi = {
  getSentiment: async (): Promise<SentimentData> => {
    const response = await apiClient.get('/sentiment');
    return response.data;
  },
};