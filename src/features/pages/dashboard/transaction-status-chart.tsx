'use client';

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

// Sample data - replace with actual data from your API
const data = [
  { name: 'Success', value: 540, color: '#10b981' },
  { name: 'Pending', value: 320, color: '#f59e0b' },
  { name: 'Failed', value: 210, color: '#ef4444' },
];

export function TransactionStatusChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value} transactions`, 'Count']}
            contentStyle={{
              backgroundColor: '#001f54',
              borderColor: 'rgba(79, 156, 249, 0.2)',
            }}
            itemStyle={{ color: '#f8fafc' }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
