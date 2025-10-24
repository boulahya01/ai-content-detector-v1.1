import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export interface CreditTransaction {
  id: string;
  amount: number;
  type: 'PURCHASE' | 'USAGE' | 'REFUND' | 'BONUS';
  createdAt: string;
  meta: Record<string, any>;
}

interface CreditsContextValue {
  balance: number;
  transactions: CreditTransaction[];
  isLoading: boolean;
  error: Error | null;
  purchaseCredits: (packageId: string) => Promise<void>;
  refreshBalance: () => Promise<void>;
}

const CreditsContext = createContext<CreditsContextValue | undefined>(undefined);

export function CreditsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBalance = async () => {
    if (!user) {
      setBalance(0);
      return;
    }

    try {
      const response = await api.get('/api/credits/balance');
      setBalance(response.data.balance);
    } catch (error) {
      console.error('Failed to fetch credit balance:', error);
      setError(error as Error);
    }
  };

  const fetchTransactions = async () => {
    if (!user) {
      setTransactions([]);
      return;
    }

    try {
      const response = await api.get('/api/credits/history');
      setTransactions(response.data);
    } catch (error) {
      console.error('Failed to fetch credit history:', error);
      setError(error as Error);
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    await Promise.all([fetchBalance(), fetchTransactions()]);
    setIsLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  const purchaseCredits = async (packageId: string) => {
    try {
      await api.post(`/api/credits/purchase/${packageId}`);
      await refreshData();
    } catch (error) {
      console.error('Failed to purchase credits:', error);
      throw error;
    }
  };

  const refreshBalance = async () => {
    await fetchBalance();
  };

  return (
    <CreditsContext.Provider
      value={{
        balance,
        transactions,
        isLoading,
        error,
        purchaseCredits,
        refreshBalance,
      }}
    >
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  const context = useContext(CreditsContext);
  if (context === undefined) {
    throw new Error('useCredits must be used within a CreditsProvider');
  }
  return context;
}