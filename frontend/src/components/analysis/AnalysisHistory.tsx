import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { FiClock, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { analysisService } from '@/api/analysis';
import { toast } from 'sonner';

interface HistoryEntry {
  id: string;
  createdAt: string;
  authenticityScore: number;
  aiProbability: number;
  textPreview: string;
}

interface AnalysisHistoryProps {
  onSelect?: (id: string) => void;
  className?: string;
}

export default function AnalysisHistory({ onSelect, className = '' }: AnalysisHistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await analysisService.getHistory(page);
      if (response.success && response.data) {
        setHistory(response.data.items);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      toast.error('Failed to load analysis history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h2 className="text-lg font-medium text-white/90">Analysis History</h2>

      {history.length === 0 ? (
        <div className="text-center py-8 text-white/60">
          <p>No analysis history found</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="rounded-lg border border-white/10 bg-black/40 backdrop-blur-sm p-4 hover:bg-black/60 transition-colors cursor-pointer"
                onClick={() => onSelect?.(entry.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/90 truncate">{entry.textPreview}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <FiClock className="w-4 h-4 text-white/40" />
                      <span className="text-xs text-white/60">
                        {format(new Date(entry.createdAt), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-sm font-medium ${getScoreColor(entry.authenticityScore)}`}>
                      {Math.round(entry.authenticityScore)}% Authentic
                    </span>
                    <span className="text-xs text-white/60">
                      {Math.round(entry.aiProbability)}% AI Detection
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 text-sm text-white/60 hover:text-white/90 disabled:opacity-50"
              >
                <FiChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="text-sm text-white/60">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 text-sm text-white/60 hover:text-white/90 disabled:opacity-50"
              >
                Next
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      <div className="text-center pt-4">
        <Link
          to="/dashboard"
          className="text-sm text-white/60 hover:text-white/90 transition-colors"
        >
          View All History
        </Link>
      </div>
    </div>
  );
}