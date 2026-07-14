import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        padding: '10px 14px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
      }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: '#0F172A' }}>{label}</p>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#2563EB', fontWeight: 500 }}>
          {payload[0].name}: ${payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const LineTrendChart = ({ data, xKey = "name", dataKey = "amount", strokeColor = "#2563EB" }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
        <XAxis
          dataKey={xKey}
          stroke="#94A3B8"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          dy={10}
        />
        <YAxis
          stroke="#94A3B8"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey={dataKey}
          name="Amount Paid"
          stroke={strokeColor}
          strokeWidth={3}
          activeDot={{ r: 8 }}
          dot={{ r: 4, strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LineTrendChart;
