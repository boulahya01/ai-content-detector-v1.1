import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Balance, Transaction } from '@/types/shobeis';
import { shobeisApi } from '@/api/shobeis';
import { useAuth } from '@/hooks/useAuth';

interface ShobeisContextType {
  balance: Balance | null;
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  refreshBalance: () => Promise<void>;
  fetchTransactions: (params?: {
    limit?: number;
    offset?: number;
    type_filter?: string;
    start_date?: string;
    end_date?: string;
  }) => Promise<void>;
  estimateCost: (wordCount: number, fileType: string, isBulk: boolean, actionType?: string) => Promise<number>;
}

const ShobeisContext = createContext<ShobeisContextType | undefined>(undefined);

export const ShobeisProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [balance, setBalance] = useState<Balance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshBalance = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const balanceData = await shobeisApi.getBalance();
      setBalance(balanceData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch balance');
      console.error('Balance fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchTransactions = useCallback(async (params?: {
    limit?: number;
    offset?: number;
    type_filter?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const transactionData = await shobeisApi.listTransactions(params);
      setTransactions(transactionData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch transactions');
      console.error('Transactions fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const estimateCost = useCallback(async (
    wordCount: number,
    fileType: string,
    isBulk: boolean,
    actionType: string = 'analysis' // Default action type
  ) => {
    try {
      const estimate = await shobeisApi.estimateCost({
        action_type: actionType,
        word_count: wordCount,
        file_type: fileType,
        is_bulk: isBulk,
      });
      return estimate.cost;
    } catch (err) {
      setError('Failed to estimate cost');
      console.error('Cost estimation error:', err);
      return 0;
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refreshBalance();
    }
  }, [isAuthenticated, refreshBalance]);

  const value = {
    balance,
    transactions,
    loading,
    error,
    refreshBalance,
    fetchTransactions,
    estimateCost,
  };

  return (
    <ShobeisContext.Provider value={value}>
      {children}
    </ShobeisContext.Provider>
  );
};

export const useShobeis = () => {
  const context = useContext(ShobeisContext);
  if (context === undefined) {
    throw new Error('useShobeis must be used within a ShobeisProvider');
  }
  return context;
};