

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import TextAnalyzer from '@/components/analysis/TextAnalyzer';
import AnalysisResult from '@/components/analysis/AnalysisResult';
import AnalysisHistory from '@/components/analysis/AnalysisHistory';
import { useAnalysis } from '@/context/AnalysisContext';

type Indicator = {
  type: string;
  description: string;
  confidence: number;
};

type SimpleResult = {
  id?: string;
  authenticityScore: number;
  aiProbability: number;
  confidenceLevel?: 'high' | 'medium' | 'low';
  indicators?: Indicator[];
};

export default function NewAnalysisPage(): JSX.Element {
  const navigate = useNavigate();
  const { analyzeText, analyzeFile } = useAnalysis();

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SimpleResult | null>(null);

  const handleAnalyze = async (text: string, file?: File) => {
    setIsLoading(true);
    try {
      let res: any;
      if (file) {
        res = await analyzeFile(file);
      } else {
        res = await analyzeText(text, { detailed: true });
      }

      const data = res as any;
      const normalized: SimpleResult = {
        id: data.id || data.analysisId,
        authenticityScore: Math.round((data.authenticityScore ?? (100 - (data.aiProbability ?? 0))) as number),
        aiProbability: Math.round((data.aiProbability ?? 0) as number),
        confidenceLevel: data.confidenceLevel || undefined,
        indicators: data.indicators || data.analysisDetails?.indicators || [],
      };

      setResult(normalized);
      toast.success('Analysis completed');
    } catch (err: any) {
      console.error('Analyze error', err);
      toast.error(err?.message || 'Failed to analyze');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!result?.id) return;
    try {
      // download report placeholder
      toast.success('Report download started');
    } catch (err) {
      toast.error('Failed to download report');
    }
  };

  const handleShare = () => {
    if (!result?.id) return;
    const url = `${window.location.origin}/analysis/${result.id}`;
    navigator.clipboard.writeText(url);
    toast.success('Link copied');
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8 mt-8">
        <div className="space-y-4">
          <TextAnalyzer onAnalyze={handleAnalyze} isLoading={isLoading} />
        </div>

        <div className="lg:w-[420px] space-y-8">
          {result ? (
            <AnalysisResult
              result={result}
              onDownload={handleDownload}
              onShare={handleShare}
              onRetry={() => setResult(null)}
            />
          ) : (
            <AnalysisHistory onSelect={(id) => navigate(`/analysis/${id}`)} />
          )}
        </div>
      </div>
    </div>
  );
}