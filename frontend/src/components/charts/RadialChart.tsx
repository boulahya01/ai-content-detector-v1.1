import { useId, useMemo } from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';

interface RadialChartProps {
  size?: number;
  stroke?: number;
  value: number; // 0..100
  trackColor?: string;
  progressColor?: string;
  label?: string;
}

export default function RadialChart({
  size = 120,
  stroke = 12,
  value,
  trackColor = 'rgba(255,255,255,0.04)',
  progressColor = 'var(--accent-500)',
  label,
}: RadialChartProps) {
  const id = useId().replace(/:/g, '-');
  const clamped = Math.max(0, Math.min(100, Math.round(value)));

  const data = useMemo(() => [
    { name: 'ai', value: clamped, fill: progressColor },
  ], [clamped, progressColor]);

  // radial chart inner/outer radius as percentages of size
  const outerRadius = 80; // percent
  const innerRadius = 60; // percent

  return (
    <div style={{ width: size, height: size }} className="inline-block relative">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius={`${innerRadius}%`}
          outerRadius={`${outerRadius}%`}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <defs>
            <linearGradient id={`g-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={progressColor} stopOpacity="1" />
              <stop offset="100%" stopColor={progressColor} stopOpacity="0.8" />
            </linearGradient>
          </defs>
          <RadialBar
            dataKey="value"
            cornerRadius={stroke}
            background={{ fill: trackColor }}
            fill={`url(#g-${id})`}
            isAnimationActive={true}
            animationDuration={900}
          />
        </RadialBarChart>
      </ResponsiveContainer>

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="text-2xl font-extrabold text-white/95">{clamped}%</div>
        {label && <div className="text-xs text-white/60">{label}</div>}
      </div>
    </div>
  );
}
