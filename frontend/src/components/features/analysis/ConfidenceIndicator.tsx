type Props = {
  score: number; // accepts 0..1 or 0..100
  size?: number; // px
  showLabel?: boolean;
};

export default function ConfidenceIndicator({ score, size = 56, showLabel = true }: Props) {
  // normalize score: if between 0 and 1 treat as fraction
  let raw = score;
  if (raw <= 1) raw = raw * 100;
  const pct = Math.max(0, Math.min(100, Math.round(raw)));
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
            stroke="rgba(255,255,255,0.04)"
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
            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 900ms cubic-bezier(.2,.9,.2,1)' }}
          />
        </g>
      </svg>
      {showLabel && (
        <div className="text-sm text-white/80">
          <div className="text-lg font-semibold">{pct}%</div>
          <div className="text-xs text-white/60">authenticity</div>
        </div>
      )}
    </div>
  );
}