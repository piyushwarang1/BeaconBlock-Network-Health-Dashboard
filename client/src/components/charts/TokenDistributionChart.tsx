import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface TokenDistributionData {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

interface TokenDistributionChartProps {
  data: TokenDistributionData[];
  title?: string;
  height?: number;
}

export default function TokenDistributionChart({
  data,
  height = 300
}: TokenDistributionChartProps) {
  const chartData = {
    labels: data.map(item => item.category),
    datasets: [
      {
        data: data.map(item => item.amount),
        backgroundColor: data.map(item => item.color),
        borderColor: data.map(item => item.color),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const percentage = data[context.dataIndex]?.percentage || 0;
            return `${label}: ${value.toLocaleString()} (${percentage.toFixed(1)}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      <Pie data={chartData} options={options} />
    </div>
  );
}