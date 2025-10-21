import React from 'react';

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
  stroke = 10,
  value,
  trackColor = '#111827',
  progressColor = '#a78bfa',
  label,
}: RadialChartProps) {
  const radius = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="inline-flex flex-col items-center">
      <svg width={size} height={size} className="block">
        <defs>
          <linearGradient id="radialGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={progressColor} stopOpacity="1" />
            <stop offset="100%" stopColor={progressColor} stopOpacity="0.8" />
          </linearGradient>
        </defs>
        <g transform={`translate(${cx}, ${cy})`}>
          <circle
            r={radius}
            cx={0}
            cy={0}
            fill="transparent"
            stroke={trackColor}
            strokeWidth={stroke}
            className="opacity-30"
          />
          <circle
            r={radius}
            cx={0}
            cy={0}
            fill="transparent"
            stroke="url(#radialGradient)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            transform="rotate(-90)"
          />
        </g>
      </svg>
      <div className="mt-2 text-center">
        <div className="text-xl font-semibold text-white/90">{Math.round(clamped)}%</div>
        {label && <div className="text-xs text-white/60">{label}</div>}
      </div>
    </div>
  );
}
