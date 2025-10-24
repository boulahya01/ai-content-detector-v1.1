import React from 'react';

export default function Tooltip({ children, content, className }: { children: React.ReactNode; content: React.ReactNode; className?: string }) {
  return (
    <span className={`relative inline-block ${className ?? ''}`}>
      {children}
      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 whitespace-nowrap rounded-md bg-[color:var(--card-surface)] text-[color:var(--text-color)] px-3 py-1 text-xs shadow-md opacity-0 pointer-events-none transition-opacity duration-150 group-hover:opacity-100">
        {content}
      </span>
    </span>
  );
}
