export default function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-white/6 ${className}`} />;
}
