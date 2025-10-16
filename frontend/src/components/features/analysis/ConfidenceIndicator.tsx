type Props = {
  score: number; // 0..1
  size?: number; // px
  showLabel?: boolean;
};

export default function ConfidenceIndicator({ score, size = 48, showLabel = true }: Props) {
  const pct = Math.max(0, Math.min(100, Math.round(score * 100)));
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  // color mapping: higher authenticity score -> greener
  const color = pct > 75 ? '#10b981' : pct > 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex items-center space-x-3">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <g transform={`translate(${size / 2}, ${size / 2})`}>
          <circle
            r={r}
            cx={0}
            cy={0}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={stroke}
          />
          <circle
            r={r}
            cx={0}
            cy={0}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
          />
        </g>
      </svg>
      {showLabel && (
        <div className="text-sm text-white/80">
          <div className="text-base font-semibold">{pct}%</div>
          <div className="text-xs text-white/60">authenticity</div>
        </div>
      )}
    </div>
  );
}