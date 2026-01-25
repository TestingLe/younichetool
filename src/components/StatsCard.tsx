'use client';

import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'red' | 'blue' | 'green' | 'purple' | 'orange';
}

const colorClasses = {
  red: 'from-red-500/20 to-red-600/10 border-red-500/30',
  blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
  green: 'from-green-500/20 to-green-600/10 border-green-500/30',
  purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
  orange: 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
};

const iconColors = {
  red: 'text-red-400',
  blue: 'text-blue-400',
  green: 'text-green-400',
  purple: 'text-purple-400',
  orange: 'text-orange-400',
};

export default function StatsCard({ title, value, icon: Icon, trend, color = 'red' }: StatsCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colorClasses[color]} border p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
          {trend && (
            <div className={`mt-2 flex items-center text-sm ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              <span>{trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
              <span className="ml-1 text-gray-500">vs last month</span>
            </div>
          )}
        </div>
        <div className={`rounded-xl bg-black/20 p-3 ${iconColors[color]}`}>
          <Icon size={24} />
        </div>
      </div>
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/5 blur-2xl" />
    </div>
  );
}
