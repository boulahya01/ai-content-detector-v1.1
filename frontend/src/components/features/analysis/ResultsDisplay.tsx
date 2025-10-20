import React from 'react';
import { useAnalyzer } from '../../../hooks/useAnalyzer';
import { AnalysisResult } from '../../../types';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import ConfidenceIndicator from './ConfidenceIndicator';

export interface ResultsDisplayProps {
  className?: string;
}

export default function ResultsDisplay({ className }: ResultsDisplayProps) {
  const { results, getHistory, exportResults } = useAnalyzer();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [selectedResult, setSelectedResult] = React.useState<AnalysisResult | null>(null);

  React.useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await getHistory();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (result: AnalysisResult) => {
    try {
      await exportResults(result.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export results');
    }
  };

  const filteredResults = React.useMemo(() => {
    if (!results) return [];
    if (filter === 'all') return results;
    return results.filter(r => r.confidenceLevel === filter);
  }, [results, filter]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className={className}>
      {error && (
        <div className="mb-4 p-3 text-sm text-red-500 bg-red-500/10 rounded-lg border border-red-500/20">
          {error}
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="bg-white/5 text-white/90 rounded-lg px-3 py-2 border border-white/10"
            >
              <option value="all">All Results</option>
              <option value="high">High Confidence</option>
              <option value="medium">Medium Confidence</option>
              <option value="low">Low Confidence</option>
            </select>

            <Button
              variant="outline"
              onClick={loadHistory}
              className="text-white/70 hover:text-white/90 bg-white/5 hover:bg-white/10 border-white/10"
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredResults.map((result) => (
          <div
            key={result.id}
            className="dashboard-card p-6 hover:border-accent-500/30 transition-all cursor-pointer group"
            onClick={() => setSelectedResult(result)}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-medium text-white/90">
                      {result.fileName || 'Text Analysis'}
                    </h3>
                    <span className="px-2 py-0.5 text-xs font-medium bg-accent-500/20 text-accent-300 rounded-full">
                      {result.confidenceLevel.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-white/60">
                    {new Date(result.createdAt).toLocaleString()}
                  </p>
                </div>
                <ConfidenceIndicator score={result.authenticityScore} />
              </div>

              <p className="text-white/70 line-clamp-2">
                {result.contentPreview}
              </p>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-4">
                  <span className="text-white/60 text-sm">
                    {result.contentPreview.length} characters
                  </span>
                  <span className={`text-sm ${result.authenticityScore >= 80 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                    {result.authenticityScore >= 80 ? 'Human Written' : 'AI Generated'}
                  </span>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExport(result);
                    }}
                    className="text-white/70 hover:text-white/90 bg-white/5 hover:bg-white/10 border-white/10"
                  >
                    Export
                  </Button>
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedResult(result);
                    }}
                    className="bg-accent-500 hover:bg-accent-600 text-white"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredResults.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No analysis results found
          </div>
        )}
      </div>

      {selectedResult && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="dashboard-card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white/90">
                    Analysis Details
                  </h3>
                  <div className="flex items-center gap-3 mt-2">
                    <p className="text-white/60">
                      {selectedResult.fileName || 'Text Analysis'}
                    </p>
                    <span className="px-2 py-0.5 text-xs font-medium bg-accent-500/20 text-accent-300 rounded-full">
                      {selectedResult.confidenceLevel.toUpperCase()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedResult(null)}
                  className="text-white/60 hover:text-white/90 p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <h4 className="font-medium text-white/90 mb-2">Content</h4>
                  <p className="text-white/70 whitespace-pre-wrap">
                    {selectedResult.contentPreview}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <h4 className="font-medium text-white/90 mb-4">Analysis Score</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className={`text-4xl font-bold ${
                        selectedResult.authenticityScore >= 80 ? 'text-[#10b981]' : 'text-[#ef4444]'
                      }`}>
                        {selectedResult.authenticityScore}%
                      </div>
                      <div className="text-white/60 text-sm mt-1">
                        {selectedResult.authenticityScore >= 80 ? 'Human Written' : 'AI Generated'}
                      </div>
                    </div>
                    <ConfidenceIndicator score={selectedResult.authenticityScore} />
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <h4 className="font-medium text-white/90 mb-4">Detailed Analysis</h4>
                  <div className="space-y-3">
                    {Object.entries(selectedResult.analysisDetails).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                        <span className="text-white/70">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="text-white font-medium">
                          {typeof value === 'number' ? `${(value * 100).toFixed(1)}%` : value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-white/10">
                <Button
                  variant="outline"
                  onClick={() => handleExport(selectedResult)}
                  className="text-white/70 hover:text-white/90 bg-white/5 hover:bg-white/10 border-white/10"
                >
                  Export Results
                </Button>
                <Button 
                  onClick={() => setSelectedResult(null)}
                  className="bg-accent-500 hover:bg-accent-600 text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
