export default function Spinner({ size = 6 }: { size?: number }) {
  const s = `${size}`;
  return (
    <div
      className={`animate-spin rounded-full border-t-2 border-white/20`}
      style={{ width: `${s}rem`, height: `${s}rem` }}
    />
  );
}
