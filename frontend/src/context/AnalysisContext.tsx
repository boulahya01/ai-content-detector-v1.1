import React, { createContext, useContext, useState, useCallback } from 'react';
import type { AnalysisResult, AnalysisProgress } from '@/types/api';
import { analysisService } from '@/api/analysis';
import { wsManager } from '@/lib/websocket';

interface AnalysisContextType {
  currentAnalysis: AnalysisResult | null;
  analysisHistory: AnalysisResult[];
  isAnalyzing: boolean;
  error: Error | null;
  progress: {
    status: 'processing' | 'completed' | 'error';
    percent: number;
    message?: string;
  } | null;
  analyzeText: (text: string, options?: any) => Promise<AnalysisResult>;
  analyzeFile: (file: File) => Promise<AnalysisResult>;
  clearCurrentAnalysis: () => void;
  fetchHistory: (page?: number, limit?: number) => Promise<AnalysisResult[]>;
  deleteHistoryItem: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  fetchAnalysisById: (id: string) => Promise<AnalysisResult>;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
};

interface AnalysisProviderProps {
  children: React.ReactNode;
}

export const AnalysisProvider: React.FC<AnalysisProviderProps> = ({ children }) => {
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState<{
    status: 'processing' | 'completed' | 'error';
    percent: number;
    message?: string;
  } | null>(null);

  const handleAnalysisProgress = useCallback((progressData: AnalysisProgress) => {
    const { status, progress: percent, message, result, error: progressError } = progressData;
    
    setProgress({
      status,
      percent,
      message
    });

    if (status === 'completed' && result) {
      setCurrentAnalysis(result);
      setIsAnalyzing(false);
    } else if (status === 'error') {
      setError(new Error(progressError || 'Analysis failed'));
      setIsAnalyzing(false);
    }
  }, []);

  const analyzeText = useCallback(async (content: string, options?: any): Promise<AnalysisResult> => {
  setIsAnalyzing(true);
    setError(null);
    setProgress({ status: 'processing', percent: 0, message: 'Starting analysis...' });
    
    try {
  // mark this as a non-billable test analysis from the interactive UI
  const payload: any = { content, is_test: true };
  if (options) payload.options = options;
  const response = await analysisService.analyzeText(payload);

      // Backend may return the final analysis directly (synchronous)
  const result = response.data as any;
  const analysisId = result?.analysisId || result?.id;

  if (!analysisId) {
        // Synchronous flow: backend returned final result
        if (result) {
          setCurrentAnalysis(result as AnalysisResult);
          setProgress({ status: 'completed', percent: 100, message: 'Analysis complete' });
          setIsAnalyzing(false);
          return result as AnalysisResult;
        }
        throw new Error('No analysis result returned');
      }

      // Async flow: subscribe to websocket progress for this analysisId
      return await new Promise<AnalysisResult>((resolve, reject) => {
        const handler = (progressData: AnalysisProgress) => {
          // reuse existing handler logic to update UI
          handleAnalysisProgress(progressData);
          if (progressData.status === 'completed' && progressData.result) {
            wsManager.unsubscribeFromAnalysis(analysisId);
            setIsAnalyzing(false);
            resolve(progressData.result as AnalysisResult);
          } else if (progressData.status === 'error') {
            wsManager.unsubscribeFromAnalysis(analysisId);
            setIsAnalyzing(false);
            reject(new Error(progressData.error || 'Analysis failed'));
          }
        };

        wsManager.subscribeToAnalysis(analysisId, handler);
      });
    } catch (err) {
      const error = err as Error;
      setError(error);
      setProgress({ status: 'error', percent: 0, message: error.message });
      throw error;
    }
  }, [currentAnalysis, error, isAnalyzing, handleAnalysisProgress]);

  const analyzeFile = useCallback(async (file: File): Promise<AnalysisResult> => {
    setIsAnalyzing(true);
    setError(null);
    setProgress({ status: 'processing', percent: 0, message: 'Uploading file...' });
    
    try {
      const response = await analysisService.analyzeFile(file, undefined, (percent) => {
        setProgress({ 
          status: 'processing', 
          percent, 
          message: percent < 100 ? 'Uploading file...' : 'Processing file...'
        });
      });

      const result = response.data as any;
      const analysisId = result?.analysisId || result?.id;

      if (!analysisId) {
        if (result) {
          setCurrentAnalysis(result as AnalysisResult);
          setProgress({ status: 'completed', percent: 100, message: 'Analysis complete' });
          setIsAnalyzing(false);
          return result as AnalysisResult;
        }
        throw new Error('No analysis result returned');
      }

      return await new Promise<AnalysisResult>((resolve, reject) => {
        const handler = (progressData: AnalysisProgress) => {
          handleAnalysisProgress(progressData);
          if (progressData.status === 'completed' && progressData.result) {
            wsManager.unsubscribeFromAnalysis(analysisId);
            setIsAnalyzing(false);
            resolve(progressData.result as AnalysisResult);
          } else if (progressData.status === 'error') {
            wsManager.unsubscribeFromAnalysis(analysisId);
            setIsAnalyzing(false);
            reject(new Error(progressData.error || 'Analysis failed'));
          }
        };

        wsManager.subscribeToAnalysis(analysisId, handler);
      });
    } catch (err) {
      const error = err as Error;
      setError(error);
      setProgress({ status: 'error', percent: 0, message: error.message });
      throw error;
    }
  }, [currentAnalysis, error, isAnalyzing, handleAnalysisProgress]);

  const clearCurrentAnalysis = useCallback(() => {
    setCurrentAnalysis(null);
    setError(null);
  }, []);

  const fetchHistory = useCallback(async (page: number = 1, limit: number = 10) => {
    try {
      const response = await analysisService.getHistory(page, limit);
      const items = response.data.items;
      setAnalysisHistory(items);
      return items;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  const deleteHistoryItem = useCallback(async (id: string) => {
    try {
      await analysisService.deleteHistoryItem(id);
      setAnalysisHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  const clearHistory = useCallback(async () => {
    try {
      await analysisService.clearHistory();
      setAnalysisHistory([]);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  const fetchAnalysisById = useCallback(async (id: string): Promise<AnalysisResult> => {
    try {
      const response = await analysisService.getAnalysisById(id);
      return response.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  const value = {
    currentAnalysis,
    analysisHistory,
    isAnalyzing,
    error,
    progress,
    analyzeText,
    analyzeFile,
    clearCurrentAnalysis,
    fetchHistory,
    deleteHistoryItem,
    clearHistory,
    fetchAnalysisById,
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
};

export default AnalysisProvider;