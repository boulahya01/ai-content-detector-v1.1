import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalyzer } from '@/hooks/useAnalyzer';
import { toast } from 'react-hot-toast';
import AnalysisForm from '@/components/features/analysis/AnalysisForm';
import FileUpload from '@/components/features/analysis/FileUpload';
import AnalysisResults from '@/components/features/analysis/AnalysisResults';
import { AnalysisResult } from '@/types/api';

export default function AnalyzePage() {
  const location = useLocation();
  // Safely extract incoming text from location state if present
  const incomingText = ((location.state as { text?: string } | null)?.text) ?? '';
  const [result, setResult] = React.useState<AnalysisResult | null>(null);
  const [initialText] = React.useState(incomingText);
  const { isLoading, error } = useAnalyzer({
    onSuccess: (data) => {
      setResult(data);
      toast.success('Analysis completed successfully!');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to analyze content');
    },
  });

  return (
    <div className="content-container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Analyze Content</h1>

        <div className="card mb-8">
          {/* File upload component */}
          <FileUpload />
          <div className="mt-4">
            <AnalysisForm onAnalysisComplete={setResult} initialText={initialText} />
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-8">
            <p className="text-red-600">{error instanceof Error ? error.message : 'An error occurred'}</p>
          </div>
        )}

        {result && (
          <div className="mt-8">
            <AnalysisResults result={result} />
          </div>
        )}
      </div>
    </div>
  );
}