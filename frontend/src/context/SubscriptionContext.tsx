import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Subscription } from '../types';
import api from '../lib/api';

export interface SubscriptionContextType {
  subscription: Subscription | null;
  isLoading: boolean;
  updateSubscription: (plan: string) => Promise<void>;
  cancelSubscription: () => Promise<void>;
}

export const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get('/subscriptions/status');
      setSubscription(response.data);
    } catch (error) {
      console.error('Failed to fetch subscription data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  const updateSubscription = async (plan: string) => {
    try {
      const response = await api.post('/subscriptions/update', { plan });
      setSubscription(response.data);
    } catch (error) {
      console.error('Failed to update subscription:', error);
      throw error;
    }
  };

  const cancelSubscription = async () => {
    try {
      await api.post('/subscriptions/cancel');
      await fetchSubscription();
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw error;
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        isLoading,
        updateSubscription,
        cancelSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}