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
  analyzeText: (text: string) => Promise<AnalysisResult>;
  analyzeFile: (file: File) => Promise<AnalysisResult>;
  clearCurrentAnalysis: () => void;
  fetchHistory: () => Promise<void>;
  deleteHistoryItem: (id: string) => Promise<void>;
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

  const analyzeText = useCallback(async (content: string): Promise<AnalysisResult> => {
    let progressTimeout: NodeJS.Timeout;
    setIsAnalyzing(true);
    setError(null);
    setProgress({ status: 'processing', percent: 0, message: 'Starting analysis...' });
    
    try {
      const response = await analysisService.analyzeText({ content });
      const { analysisId } = response.data;

      wsManager.subscribeToAnalysis(analysisId, handleAnalysisProgress);
      
      return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          if (currentAnalysis?.id === analysisId) {
            clearInterval(checkInterval);
            wsManager.unsubscribeFromAnalysis(analysisId);
            resolve(currentAnalysis);
          } else if (!isAnalyzing) {
            clearInterval(checkInterval);
            wsManager.unsubscribeFromAnalysis(analysisId);
            if (error) reject(error);
          }
        }, 100);
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
      
      const { analysisId } = response.data;

      wsManager.subscribeToAnalysis(analysisId, handleAnalysisProgress);
      
      return new Promise((resolve, reject) => {
        const checkInterval = setInterval(() => {
          if (currentAnalysis?.id === analysisId) {
            clearInterval(checkInterval);
            wsManager.unsubscribeFromAnalysis(analysisId);
            resolve(currentAnalysis);
          } else if (!isAnalyzing) {
            clearInterval(checkInterval);
            wsManager.unsubscribeFromAnalysis(analysisId);
            if (error) reject(error);
          }
        }, 100);
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

  const fetchHistory = useCallback(async () => {
    try {
      const response = await analysisService.getHistory();
      setAnalysisHistory(response.data.items);
    } catch (err) {
      setError(err as Error);
    }
  }, []);

  const deleteHistoryItem = useCallback(async (id: string) => {
    try {
      await analysisService.deleteHistoryItem(id);
      setAnalysisHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err as Error);
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
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
};

export default AnalysisProvider;