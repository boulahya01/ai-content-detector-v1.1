import React from 'react';

type BadgeProps = {
  level: 'high' | 'medium' | 'low';
  children?: React.ReactNode;
  className?: string;
};

export default function Badge({ level, children, className = '' }: BadgeProps) {
  const base = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold';
  const color =
    level === 'high'
      ? 'bg-red-900/40 text-red-300 border border-red-700'
      : level === 'medium'
      ? 'bg-yellow-900/40 text-yellow-300 border border-yellow-700'
      : 'bg-green-900/30 text-green-300 border border-green-700';

  return <span className={`${base} ${color} ${className}`}>{children ?? level}</span>;
}
