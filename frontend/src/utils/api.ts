import { toast } from 'react-toastify';
import { AxiosError } from 'axios';

export function handleApiError(error: unknown) {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message || error.message;
    toast.error(message);
    return message;
  }
  
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  toast.error(message);
  return message;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || error.message;
  }
  return error instanceof Error ? error.message : 'An unexpected error occurred';
}

export function isSubscriptionExpired(subscription: { currentPeriodEnd: string } | null): boolean {
  if (!subscription) return true;
  return new Date(subscription.currentPeriodEnd) < new Date();
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}