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
        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
          <p className="text-sm text-gray-500">
            View and manage your content analysis history
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="all">All Results</option>
            <option value="high">High Confidence</option>
            <option value="medium">Medium Confidence</option>
            <option value="low">Low Confidence</option>
          </select>

          <Button
            variant="outline"
            onClick={loadHistory}
            className="ml-2"
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredResults.map((result) => (
          <Card
            key={result.id}
            className="hover:border-blue-500 transition-colors cursor-pointer"
            onClick={() => setSelectedResult(result)}
          >
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {result.fileName || 'Text Analysis'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(result.createdAt).toLocaleString()}
                  </p>
                </div>
                <ConfidenceIndicator score={result.authenticityScore} />
              </div>

              <p className="text-gray-600 line-clamp-2">
                {result.contentPreview}
              </p>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExport(result);
                  }}
                >
                  Export
                </Button>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedResult(result);
                  }}
                >
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {filteredResults.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No analysis results found
          </div>
        )}
      </div>

      {selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Analysis Details
                  </h3>
                  <p className="text-gray-500">
                    {selectedResult.fileName || 'Text Analysis'}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedResult(null)}
                  className="text-gray-400 hover:text-gray-500"
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

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Content</h4>
                  <p className="mt-1 text-gray-600 whitespace-pre-wrap">
                    {selectedResult.contentPreview}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Analysis Score</h4>
                  <div className="mt-2">
                    <ConfidenceIndicator
                      score={selectedResult.authenticityScore}
                      showDetails
                    />
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Detailed Results</h4>
                  <div className="mt-2 space-y-2">
                    {Object.entries(selectedResult.analysisDetails).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-600">{key}</span>
                        <span className="text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button
                  variant="outline"
                  onClick={() => handleExport(selectedResult)}
                >
                  Export Results
                </Button>
                <Button onClick={() => setSelectedResult(null)}>
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
