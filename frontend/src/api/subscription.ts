import api from '../lib/api';
import { Plan, Subscription, UsageStats } from '../types';

export async function getPlans(): Promise<Plan[]> {
  const response = await api.get('/pricing/plans');
  return response.data;
}

export async function createCheckoutSession(planId: string): Promise<{ url: string }> {
  const response = await api.post('/subscriptions/create', { planId });
  return response.data;
}

export async function getSubscriptionStatus(): Promise<Subscription> {
  const response = await api.get('/subscriptions/status');
  return response.data;
}

export async function cancelSubscription(): Promise<void> {
  await api.post('/subscriptions/cancel');
}

export async function getCurrentUsage(): Promise<UsageStats> {
  const response = await api.get('/usage/current');
  return response.data;
}