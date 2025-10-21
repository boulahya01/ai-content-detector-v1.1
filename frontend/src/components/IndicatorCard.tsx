import React from 'react';

interface Props {
  title: string;
  description: string;
  confidence: number; // 0..1
}

export default function IndicatorCard({ title, description, confidence }: Props) {
  const percent = Math.round(Math.max(0, Math.min(1, confidence)) * 100);
  return (
    <div className="bg-white/5 rounded-lg p-4 border border-white/6">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-white/90">{title}</div>
        <div className="text-sm text-white/60">{percent}% confidence</div>
      </div>
      <p className="text-sm text-white/70">{description}</p>
    </div>
  );
}
