import React from 'react';

export default function ProgressBar({ value = 0 }: { value?: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="w-full bg-white/6 rounded-full h-2 overflow-hidden">
      <div
        className="h-2 bg-gradient-to-r from-accent-400 to-accent-600"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
