'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// Sample data - replace with actual data from your API
const data = Array.from({ length: 30 }).map((_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - 29 + i);

  return {
    date: date.toISOString().split('T')[0],
    revenue: Math.floor(Math.random() * 10000000) + 1000000,
  };
});

export function RevenueChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(79, 156, 249, 0.1)"
          />
          <XAxis
            dataKey="date"
            tick={{ fill: '#8ecae6' }}
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.getDate().toString();
            }}
          />
          <YAxis
            tick={{ fill: '#8ecae6' }}
            tickFormatter={(value) => {
              return new Intl.NumberFormat('id-ID', {
                notation: 'compact',
                compactDisplay: 'short',
                style: 'currency',
                currency: 'IDR',
              }).format(value);
            }}
          />
          <Tooltip
            formatter={(value) => [
              new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
              }).format(value as number),
              'Revenue',
            ]}
            labelFormatter={(label) => {
              const date = new Date(label);
              return date.toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });
            }}
            contentStyle={{
              backgroundColor: '#001f54',
              borderColor: 'rgba(79, 156, 249, 0.2)',
            }}
            itemStyle={{ color: '#f8fafc' }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#4f9cf9"
            fill="rgba(79, 156, 249, 0.2)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
