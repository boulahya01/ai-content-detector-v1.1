import { useState, useCallback } from 'react';
import { useShobeis } from '@/context/ShobeisContext';
import { shobeisApi } from '@/api/shobeis';
import type { Transaction } from '@/types/shobeis';

interface UseTransactionsResult {
  createAnalysisTransaction: (params: {
    wordCount: number;
    fileType: string;
    isBulk: boolean;
    meta?: Record<string, any>;
  }) => Promise<Transaction>;
  loading: boolean;
  error: string | null;
}

export function useTransactions(): UseTransactionsResult {
  const { refreshBalance } = useShobeis();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAnalysisTransaction = useCallback(async ({
    wordCount,
    fileType,
    isBulk,
    meta = {}
  }: {
    wordCount: number;
    fileType: string;
    isBulk: boolean;
    meta?: Record<string, any>;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const transaction = await shobeisApi.createTransaction('analysis', {
        word_count: wordCount,
        file_type: fileType,
        is_bulk: isBulk,
        meta
      });

      // Refresh balance after successful transaction
      await refreshBalance();

      return transaction;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create transaction';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshBalance]);

  return {
    createAnalysisTransaction,
    loading,
    error
  };
}