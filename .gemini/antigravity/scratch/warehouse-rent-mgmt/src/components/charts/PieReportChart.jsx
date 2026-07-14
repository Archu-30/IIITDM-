import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const COLORS = ['#10B981', '#3B82F6', '#EF4444', '#64748B'];

const PieReportChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={4}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [`${value} Warehouses`, 'Count']}
          contentStyle={{
            borderRadius: '8px',
            borderColor: '#E2E8F0',
            fontSize: '0.875rem'
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          iconSize={10}
          wrapperStyle={{ fontSize: '0.875rem' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PieReportChart;
