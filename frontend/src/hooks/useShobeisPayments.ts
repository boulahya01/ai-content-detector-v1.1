import { useState, useCallback } from 'react';
import { useShobeis } from '@/context/ShobeisContext';
import { shobeisApi } from '@/api/shobeis';
import type { Transaction } from '@/types/shobeis';

interface UseShobeisPaymentsResult {
  purchaseShobeis: (params: {
    amount: number;
    paymentMethodId: string;
  }) => Promise<Transaction>;
  refundTransaction: (params: {
    transactionId: string;
    reason: string;
  }) => Promise<Transaction>;
  loading: boolean;
  error: string | null;
}

export function useShobeisPayments(): UseShobeisPaymentsResult {
  const { refreshBalance } = useShobeis();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const purchaseShobeis = useCallback(async ({
    amount,
    paymentMethodId
  }: {
    amount: number;
    paymentMethodId: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const transaction = await shobeisApi.purchaseShobeis({
        amount,
        payment_method_id: paymentMethodId
      });

      // Refresh balance after successful purchase
      await refreshBalance();

      return transaction;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to purchase Shobeis';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshBalance]);

  const refundTransaction = useCallback(async ({
    transactionId,
    reason
  }: {
    transactionId: string;
    reason: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const transaction = await shobeisApi.refundTransaction({
        transaction_id: transactionId,
        reason
      });

      // Refresh balance after successful refund
      await refreshBalance();

      return transaction;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to process refund';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshBalance]);

  return {
    purchaseShobeis,
    refundTransaction,
    loading,
    error
  };
}