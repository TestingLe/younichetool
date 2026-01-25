'use client';

import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface AnalyticsChartProps {
  data: Array<{
    date: string;
    views: number;
    subscribers: number;
    likes: number;
  }>;
}

type MetricType = 'views' | 'subscribers' | 'likes';

const metricConfig = {
  views: { color: '#FF0000', label: 'Views' },
  subscribers: { color: '#22C55E', label: 'Subscribers' },
  likes: { color: '#3B82F6', label: 'Likes' },
};

export default function AnalyticsChart({ data }: AnalyticsChartProps) {
  const [activeMetric, setActiveMetric] = useState<MetricType>('views');
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-gray-700 bg-gray-900 p-3 shadow-xl">
          <p className="text-sm text-gray-400">{label}</p>
          <p className="text-lg font-bold" style={{ color: metricConfig[activeMetric].color }}>
            {payload[0].value.toLocaleString()} {metricConfig[activeMetric].label}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-white">Channel Analytics</h3>
        <div className="flex gap-2">
          {(Object.keys(metricConfig) as MetricType[]).map((metric) => (
            <button
              key={metric}
              onClick={() => setActiveMetric(metric)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeMetric === metric
                  ? 'text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
              style={{
                backgroundColor: activeMetric === metric ? metricConfig[metric].color : undefined,
              }}
            >
              {metricConfig[metric].label}
            </button>
          ))}
          <div className="ml-2 flex rounded-lg border border-gray-700">
            <button
              onClick={() => setChartType('area')}
              className={`rounded-l-lg px-3 py-2 text-sm ${
                chartType === 'area' ? 'bg-gray-700 text-white' : 'text-gray-400'
              }`}
            >
              Area
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`rounded-r-lg px-3 py-2 text-sm ${
                chartType === 'bar' ? 'bg-gray-700 text-white' : 'text-gray-400'
              }`}
            >
              Bar
            </button>
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`gradient-${activeMetric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={metricConfig[activeMetric].color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={metricConfig[activeMetric].color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={activeMetric}
                stroke={metricConfig[activeMetric].color}
                fill={`url(#gradient-${activeMetric})`}
                strokeWidth={2}
              />
            </AreaChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey={activeMetric} fill={metricConfig[activeMetric].color} radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
