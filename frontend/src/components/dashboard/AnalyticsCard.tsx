import { ReactNode } from 'react';
import Skeleton from '@/components/ui/Skeleton';
import CardMenu from '@/components/ui/CardMenu';

interface AnalyticsCardProps {
  title: string;
  isLoading?: boolean;
  error?: string | null;
  children: ReactNode;
  onExportCSV?: () => void;
  onExportPDF?: () => void;
}

export function AnalyticsCard({ title, isLoading, error, children, onExportCSV, onExportPDF }: AnalyticsCardProps) {
  return (
    <div className="dashboard-card p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        {(onExportCSV || onExportPDF) && (
          <div className="flex items-center gap-2">
            <CardMenu onExportCSV={onExportCSV} onExportPDF={onExportPDF} />
          </div>
        )}
      </div>
      
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      )}

      {error && (
        <div className="text-red-500 bg-red-100 rounded-lg p-4">
          <p>{error}</p>
          <button 
            className="text-sm text-red-700 hover:text-red-800 mt-2 underline"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && children}
    </div>
  );
}