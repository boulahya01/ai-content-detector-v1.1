import { useState, useCallback, useEffect } from 'react';
import { useAnalysis } from '@/context/AnalysisContext';
import type { AnalysisResult } from '@/types/api';

interface UseAnalyzerOptions {
  onSuccess?: (result: AnalysisResult) => void;
  onError?: (error: Error) => void;
  autoClean?: boolean;
}

export const useAnalyzer = (options: UseAnalyzerOptions = {}) => {
  const { onSuccess, onError, autoClean = true } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { analyzeText, analyzeFile, clearCurrentAnalysis } = useAnalysis();

  const handleTextAnalysis = useCallback(async (text: string): Promise<AnalysisResult | void> => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await analyzeText(text);
      onSuccess?.(result);
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [analyzeText, onSuccess, onError]);

  const handleFileAnalysis = useCallback(async (file: File): Promise<AnalysisResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await analyzeFile(file);
      onSuccess?.(result);
      return result;
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [analyzeFile, onSuccess, onError]);

  const reset = useCallback(() => {
    setError(null);
    clearCurrentAnalysis();
  }, [clearCurrentAnalysis]);

  // Cleanup on unmount if autoClean is true
  useEffect(() => {
    return () => {
      if (autoClean) {
        clearCurrentAnalysis();
      }
    };
  }, [autoClean, clearCurrentAnalysis]);

  return {
    isLoading,
    error,
    analyzeText: handleTextAnalysis,
    analyzeFile: handleFileAnalysis,
    reset,
  };
};

// Additional utility hooks

export const useAnalysisHistory = () => {
  const { analysisHistory, fetchHistory, deleteHistoryItem } = useAnalysis();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await fetchHistory();
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchHistory]);

  const deleteItem = useCallback(async (id: string) => {
    try {
      await deleteHistoryItem(id);
    } catch (err) {
      setError(err as Error);
    }
  }, [deleteHistoryItem]);

  return {
    history: analysisHistory,
    isLoading,
    error,
    loadHistory,
    deleteItem,
  };
};

export default useAnalyzer;