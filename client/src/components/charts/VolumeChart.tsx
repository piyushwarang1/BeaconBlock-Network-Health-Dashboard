import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface VolumeChartProps {
  pairAddress: string;
  days?: number;
  height?: number;
  data?: any;
}

export default function VolumeChart({ days = 7, height = 300, data }: VolumeChartProps) {
  // Process the data
  const chartData = React.useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return {
        labels: [],
        datasets: []
      };
    }

    // Sort data by timestamp
    const sortedData = [...data].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return {
      labels: sortedData.map(item => new Date(item.timestamp)),
      datasets: [
        {
          label: 'Volume (USD)',
          data: sortedData.map(item => item.volume),
          backgroundColor: 'rgba(147, 51, 234, 0.6)',
          borderColor: 'rgb(147, 51, 234)',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }, [data]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              const value = context.parsed.y;
              if (value >= 1000000) {
                label += `${(value / 1000000).toFixed(2)}M`;
              } else if (value >= 1000) {
                label += `${(value / 1000).toFixed(2)}K`;
              } else {
                label += `${value.toFixed(2)}`;
              }
            }
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: (days <= 1 ? 'hour' : days <= 7 ? 'day' : 'week') as 'hour' | 'day' | 'week',
          displayFormats: {
            hour: 'HH:mm',
            day: 'MMM dd',
            week: 'MMM dd'
          }
        },
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            if (value >= 1000000) {
              return `${(value / 1000000).toFixed(1)}M`;
            }
            if (value >= 1000) {
              return `${(value / 1000).toFixed(1)}K`;
            }
            return `${value}`;
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
  };

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <p className="text-lg font-medium">No volume data available</p>
          <p className="text-sm mt-1">Trading volume will appear here once data is loaded</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}