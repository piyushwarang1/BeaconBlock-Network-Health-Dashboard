import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { useQuery } from '@tanstack/react-query';
import { priceApi } from '../../lib/api';
import { Loading } from '../ui/Loading';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
);

interface PriceChartProps {
  tokenId: string;
  days?: number;
  height?: number;
}

export default function PriceChart({ tokenId, days = 7, height = 300 }: PriceChartProps) {
  const { data: historyResponse, isLoading, error } = useQuery({
    queryKey: ['priceHistory', tokenId, days],
    queryFn: () => priceApi.getPriceHistory(tokenId, days),
    refetchInterval: 30000, // Refetch every 30 seconds for more frequent updates
    enabled: !!tokenId
  });

  const chartData = React.useMemo(() => {
    if (!historyResponse?.success || !historyResponse?.data || !Array.isArray(historyResponse.data)) {
      return {
        labels: [],
        datasets: []
      };
    }

    const priceHistory = historyResponse.data;

    // Sort by timestamp
    const sortedData = [...priceHistory].sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const labels = sortedData.map(point => new Date(point.timestamp));
    const prices = sortedData.map(point => point.price);

    // Calculate color based on price trend
    const firstPrice = prices[0] || 0;
    const lastPrice = prices[prices.length - 1] || 0;
    const isPositive = lastPrice >= firstPrice;

    // Ensure we have enough data points for a visible chart
    if (prices.length < 2) {
      return {
        labels: [],
        datasets: []
      };
    }

    return {
      labels,
      datasets: [
        {
          label: 'Price (USD)',
          data: prices,
          borderColor: isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
          backgroundColor: isPositive
            ? 'rgba(34, 197, 94, 0.1)'
            : 'rgba(239, 68, 68, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2
        }
      ]
    };
  }, [historyResponse]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          title: (context: any) => {
            const date = new Date(context[0].parsed.x);
            return date.toLocaleString();
          },
          label: (context: any) => {
            return `${context.parsed.y.toFixed(6)}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: (days <= 1 ? 'hour' : 'day') as 'hour' | 'day',
          displayFormats: {
            hour: 'HH:mm',
            day: 'MMM d'
          }
        },
        grid: {
          display: false
        },
        ticks: {
          color: '#9ca3af',
          maxRotation: 0
        }
      },
      y: {
        position: 'right' as const,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        },
        ticks: {
          color: '#9ca3af',
          callback: (value: any) => `${value.toFixed(6)}`
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div style={{ height }} className="flex items-center justify-center">
        <Loading text="Loading price data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-red-500">
        Error loading price data
      </div>
    );
  }

  if (!chartData.labels.length) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-muted-foreground">
        No price data available
      </div>
    );
  }

  return (
    <div style={{ height }}>
      <Line data={chartData} options={options} />
    </div>
  );
}