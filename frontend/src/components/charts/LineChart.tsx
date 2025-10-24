import { useId } from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DataPoint {
  date: string;
  value: number;
  [key: string]: any;
}

interface LineChartProps {
  data: DataPoint[];
  dataKey: string;
  xAxisKey?: string;
  stroke?: string;
  yAxisLabel?: string;
  tooltip?: boolean;
  grid?: boolean;
  height?: number | string;
}

export default function LineChart({
  data,
  dataKey,
  xAxisKey = 'date',
  stroke = 'var(--accent-500)',
  yAxisLabel,
  tooltip = true,
  grid = true,
  height = 300,
}: LineChartProps) {
  const id = useId().replace(/:/g, '-');

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
          margin={{ top: 5, right: 5, left: yAxisLabel ? 40 : 5, bottom: 5 }}
        >
          <defs>
            <linearGradient id={`g-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.8" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0" />
            </linearGradient>
          </defs>

          {grid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.1)"
              vertical={false}
            />
          )}

          <XAxis
            dataKey={xAxisKey}
            stroke="rgba(255,255,255,0.5)"
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
          />

          <YAxis
            stroke="rgba(255,255,255,0.5)"
            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
            label={
              yAxisLabel
                ? {
                    value: yAxisLabel,
                    angle: -90,
                    position: 'insideLeft',
                    style: { fill: 'rgba(255,255,255,0.5)', fontSize: 12 },
                  }
                : undefined
            }
          />

          {tooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '4px',
              }}
              labelStyle={{ color: 'rgba(255,255,255,0.8)' }}
              itemStyle={{ color: stroke }}
            />
          )}

          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={stroke}
            strokeWidth={2}
            dot={{ fill: stroke, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 3 }}
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}