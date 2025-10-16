import { z } from "zod";

// Common schemas
export const TransactionSchema = z.object({
  id: z.string(),
  type: z.string(),
  amount: z.number(),
  balance_before: z.number(),
  balance_after: z.number(),
  bonus_before: z.number(),
  bonus_after: z.number(),
  description: z.string().optional(),
  created_at: z.string(),
  is_refunded: z.boolean(),
  refund_reason: z.string().optional(),
  meta: z.record(z.any()).optional(),
});

export const BalanceSchema = z.object({
  shobeis_balance: z.number(),
  bonus_balance: z.number(),
  monthly_refresh_amount: z.number(),
  last_refresh_date: z.string().optional(),
  next_refresh_date: z.string().optional(),
  low_balance_warning: z.boolean(),
  subscription_tier: z.string(),
  amount: z.number(),  // Total amount (shobeis_balance + bonus_balance)
});

// Request/Response types
export const EstimateRequestSchema = z.object({
  action_type: z.string(),
  word_count: z.number().optional(),
  file_type: z.string().optional(),
  is_bulk: z.boolean().optional(),
});

export const EstimateResponseSchema = z.object({
  cost: z.number(),
  can_afford: z.boolean(),
  total_balance: z.number(),
  regular_balance: z.number(),
  bonus_balance: z.number(),
});

export const ReferralRequestSchema = z.object({
  email: z.string().email(),
});

export const PurchaseRequestSchema = z.object({
  amount: z.number(),
  payment_method_id: z.string(),
});

export const RefundRequestSchema = z.object({
  transaction_id: z.string(),
  reason: z.string(),
});

// Types
export type Transaction = z.infer<typeof TransactionSchema>;
export type Balance = z.infer<typeof BalanceSchema>;
export type EstimateRequest = z.infer<typeof EstimateRequestSchema>;
export type EstimateResponse = z.infer<typeof EstimateResponseSchema>;
export type ReferralRequest = z.infer<typeof ReferralRequestSchema>;
export type PurchaseRequest = z.infer<typeof PurchaseRequestSchema>;
export type RefundRequest = z.infer<typeof RefundRequestSchema>;