import React, { useState, useRef, useEffect } from 'react';

interface CardMenuProps {
  onExportCSV: () => void;
  onExportPDF: () => void;
}

export default function CardMenu({ onExportCSV, onExportPDF }: CardMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        className="card-control"
        aria-label="Card menu"
        onClick={() => setIsOpen(!isOpen)}
      >
        ⋯
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-8 w-48 py-2 bg-[color:var(--card-surface)] rounded-lg shadow-lg border border-white/10 z-10">
          <button
            className="w-full px-4 py-2 text-sm text-left hover:bg-white/5 flex items-center gap-2"
            onClick={() => {
              onExportCSV();
              setIsOpen(false);
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
          <button
            className="w-full px-4 py-2 text-sm text-left hover:bg-white/5 flex items-center gap-2"
            onClick={() => {
              onExportPDF();
              setIsOpen(false);
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export PDF
          </button>
        </div>
      )}
    </div>
  );
}