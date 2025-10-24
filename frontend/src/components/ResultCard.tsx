import { useEffect, useRef, useState } from 'react';
import RadialChart from '@/components/charts/RadialChart';
import { RiDownloadLine, RiUserLine } from 'react-icons/ri';
// detail-related UI (progress bars/tooltips) removed — explain modal used instead
import ExplainModal from '@/components/features/analysis/ExplainModal';
// styles are imported where needed; kept minimal here

interface Indicator {
  type: string;
  description: string;
  confidence: number;
}

interface ResultShape {
  id?: string;
  authenticityScore: number;
  aiProbability: number;
  indicators: Indicator[];
}

interface Props {
  result: ResultShape;
  onDownload?: (id?: string) => void;
  onCompare?: (id?: string) => void;
}

export default function ResultCard({ result, onDownload, onCompare }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine AI probability and a human probability fallback
  const aiRaw = typeof result.aiProbability === 'number' ? result.aiProbability : (typeof result.authenticityScore === 'number' ? result.authenticityScore : 0);
  const aiDisplay = Math.max(0, Math.min(100, aiRaw));
  const humanDisplay = Math.max(0, Math.min(100, (typeof result.authenticityScore === 'number' ? result.authenticityScore : Math.round(100 - aiDisplay))));
  const radialValue = Math.max(0, Math.min(100, Math.round(aiDisplay)));

  // animated count-up for the large percent
  const [displayPercent, setDisplayPercent] = useState(0);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    const start = performance.now();
    const duration = 700;
    const from = 0;
    const to = aiDisplay;
    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration);
      const eased = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // smooth-ish
      const value = from + (to - from) * eased;
      setDisplayPercent(Number(value.toFixed(2)));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [aiDisplay]);

  // fallback download implementation (if no onDownload provided)
  function downloadReport() {
    if (onDownload) {
      onDownload(result.id);
      return;
    }
    // simple JSON/text download fallback
    const payload = {
      id: result.id,
      authenticityScore: result.authenticityScore,
      aiProbability: result.aiProbability,
      indicators: result.indicators,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analysis-${result.id ?? 'report'}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
  <div className="rounded-2xl p-6 relative bg-[color:var(--surface-500)] shadow-md max-w-3xl">
      {/* Menu dropdown */}
      <div className="absolute top-4 right-4" ref={menuRef}>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 text-white/70 hover:text-white/90 focus:outline-none"
            aria-label="Menu"
          >
            <span className="text-lg">•••</span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1 w-40 bg-black/80 backdrop-blur-sm rounded-lg border border-white/10 shadow-lg overflow-hidden z-50">
              <button
                onClick={() => {
                  downloadReport();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/90 hover:bg-white/10"
              >
                <RiDownloadLine className="w-4 h-4" />
                <span>Download report</span>
              </button>
              <button
                onClick={() => {
                  onCompare?.(result.id);
                  setMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/90 hover:bg-white/10"
              >
                <RiUserLine className="w-4 h-4" />
                <span>Compare</span>
              </button>
            </div>
          )}
        </div>
      </div>

  <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
        {/* Left column: title + stacked large percents (AI then Human) */}
        <div className="flex-1">
          <h3 className="text-base font-semibold text-white/90 mb-2">Results</h3>

          <div className="space-y-4">
            <div>
              <div className="text-4xl md:text-5xl font-extrabold text-white/95 leading-[1]">{displayPercent}%</div>
                <div className="text-sm mt-1" style={{ color: 'var(--accent-500)', fontWeight: 500 }}>AI Probability</div>
            </div>

            <div>
              <div className="text-4xl md:text-5xl font-extrabold text-white/95 leading-[1]">{Math.round(humanDisplay)}%</div>
                <div className="text-sm mt-1" style={{ color: 'var(--accent-500)', fontWeight: 500 }}>Human</div>
            </div>
          </div>
        </div>

        {/* Right column: radial with small center label */}
        <div className="flex-shrink-0 w-44 h-44 flex items-center justify-center ml-auto md:ml-0">
          <RadialChart value={radialValue} size={156} stroke={16} progressColor="var(--accent-500)" trackColor="rgba(255,255,255,0.03)" label="AI" />
        </div>
      </div>

      {/* Actions (Explain only) */}
      <div className="mt-6 flex items-center justify-end">
  <ExplainModal indicators={result.indicators} />
      </div>

      
    </div>
  );
}
