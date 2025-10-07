import ResultsDisplay from '@/components/features/analysis/ResultsDisplay';

export default function HistoryPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Analysis History</h1>
      <ResultsDisplay />
    </div>
  );
}