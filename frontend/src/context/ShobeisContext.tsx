import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';


interface ShobeisContextType {
  balance: number;
  monthlyBalance: number;
  monthlyRefreshAmount: number;
  loading: boolean;
  error: string | null;
  refreshBalance: () => Promise<void>;
}


const ShobeisContext = createContext<ShobeisContextType>({
  balance: 0,
  monthlyBalance: 0,
  monthlyRefreshAmount: 0,
  loading: false,
  error: null,
  refreshBalance: async () => {},
});

export function useShobeisContext() {
  return useContext(ShobeisContext);
}

interface ShobeisProviderProps {
  children: React.ReactNode;
}


export function ShobeisProvider({ children }: ShobeisProviderProps) {
  const [balance, setBalance] = useState(0);
  const [monthlyBalance, setMonthlyBalance] = useState(0);
  const [monthlyRefreshAmount, setMonthlyRefreshAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const refreshBalance = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/shobeis/balance');
      setBalance(response.data.balance);
      setMonthlyBalance(response.data.monthly_balance);
      setMonthlyRefreshAmount(response.data.monthly_refresh_amount);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch balance';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      refreshBalance();
    }
  }, []);

  return (
    <ShobeisContext.Provider
      value={{
        balance,
        monthlyBalance,
        monthlyRefreshAmount,
        loading,
        error,
        refreshBalance,
      }}
    >
      {children}
    </ShobeisContext.Provider>
  );
}