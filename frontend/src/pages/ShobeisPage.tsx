import React from 'react';
import { ShobeisBalanceCard } from '@/components/dashboard/ShobeisBalanceCard';
import { TransactionHistoryCard } from '@/components/dashboard/TransactionHistoryCard';
import { ShobeisPurchaseCard } from '@/components/dashboard/ShobeisPurchaseCard';

export default function ShobeisPage() {
  return (
    <div className="content-container py-8">
      <div className="grid gap-8">
        {/* Header Section */}
        <div>
          <h1 className="text-5xl font-extrabold text-accent-3 mb-3 leading-tight">
            Your Shobeis
          </h1>
          <p className="text-lg text-muted max-w-2xl">
            Manage your virtual currency for AI content detection. Purchase, track, and utilize your Shobeis effectively.
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Balance Card - Spans full width on mobile, half on tablet, one-third on desktop */}
          <div className="md:col-span-2 xl:col-span-1">
            <ShobeisBalanceCard />
          </div>

          {/* Transaction History - Spans full width on mobile, full width on tablet, two-thirds on desktop */}
          <div className="md:col-span-2">
            <TransactionHistoryCard />
          </div>
        </div>

        {/* Purchase Section - Full Width */}
        <div className="mt-6">
          <ShobeisPurchaseCard />
        </div>
      </div>
    </div>
  );
}