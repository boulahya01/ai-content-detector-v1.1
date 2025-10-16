import React from 'react';

export interface RecentAnalysis {
  id: string;
  contentPreview: string;
  authenticityScore: number;
  confidence: number;
  createdAt: string;
}

function formatRelative(dateStr: string) {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  return `${days}d ago`;
}

export default function RecentActivityCard({ analyses }: { analyses: RecentAnalysis[] }) {
  return (
    <div className="dashboard-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
        <button className="card-control" aria-label="View all">view all</button>
      </div>
      <div className="divide-y divide-white/10">
        {analyses.length === 0 ? (
          <div className="text-muted py-6 text-center">No recent analyses.</div>
        ) : (
          analyses.slice(0, 5).map(a => (
            <div key={a.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="text-white text-sm font-medium truncate max-w-xs">{a.contentPreview}</div>
                <div className="text-xs text-muted mt-1">{formatRelative(a.createdAt)}</div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-accent-2 font-bold text-lg">{Math.round(a.authenticityScore * 100)}%</span>
                <span className="text-xs text-muted">Conf: {Math.round(a.confidence * 100)}%</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
