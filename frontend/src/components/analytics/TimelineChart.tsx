import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TimelineChartProps {
  data: Array<{
    date: string;
    value: number;
  }>;
  title: string;
  height?: number;
}

export const TimelineChart: React.FC<TimelineChartProps> = ({
  data,
  title,
  height = 300
}) => {
  return (
    <div className="p-6 bg-card rounded-lg border border-border">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div style={{ height: height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="date" 
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: 'rgba(255,255,255,0.5)' }}
            />
            <YAxis 
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: 'rgba(255,255,255,0.5)' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '4px',
              }}
              labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#5e17eb"
              strokeWidth={2}
              dot={{ fill: '#5e17eb', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: '#5e17eb' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};