import React, { useState } from 'react';
import { useShobeisPayments } from '@/hooks/useShobeisPayments';

const PACKAGE_OPTIONS = [
  { amount: 100, price: 9.99, featured: false },
  { amount: 500, price: 39.99, featured: true },
  { amount: 1000, price: 69.99, featured: false },
  { amount: 2500, price: 149.99, featured: false },
];

export function ShobeisPurchaseCard() {
  const [selectedAmount, setSelectedAmount] = useState<number>(500);
  const { purchaseShobeis, loading, error } = useShobeisPayments();

  const handlePurchase = async () => {
    const package_ = PACKAGE_OPTIONS.find(p => p.amount === selectedAmount);
    if (!package_) return;

    try {
      // TODO: Implement Stripe payment flow
      await purchaseShobeis({
        amount: selectedAmount,
        paymentMethodId: 'pm_test' // This will come from Stripe
      });
    } catch (err) {
      console.error('Purchase failed:', err);
    }
  };

  return (
    <div className="dashboard-card p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white">Purchase Shobeis</h3>
          <p className="text-sm text-muted mt-1">Select a package that suits your needs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {PACKAGE_OPTIONS.map((pkg) => (
          <button
            key={pkg.amount}
            onClick={() => setSelectedAmount(pkg.amount)}
            className={`relative p-4 rounded-lg border transition-all duration-200 ${
              selectedAmount === pkg.amount
                ? 'border-accent-500 bg-accent-500/10'
                : 'border-white/10 hover:border-accent-300/50'
            }`}
          >
            {pkg.featured && (
              <div className="absolute -top-2 -right-2">
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-white bg-accent-500 rounded-full">
                  Best Value
                </span>
              </div>
            )}
            
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {pkg.amount.toLocaleString()} <span className="text-accent-300">₴</span>
              </div>
              <div className="text-xl font-semibold text-white mb-2">
                ${pkg.price}
              </div>
              <div className="text-sm text-muted">
                ${(pkg.price / pkg.amount).toFixed(3)} per Shobei
              </div>
            </div>
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 text-red-500 bg-red-500/10 rounded-lg p-4">
          <p>{error}</p>
        </div>
      )}

      <button
        onClick={handlePurchase}
        disabled={loading}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
          loading
            ? 'bg-accent-500/50 cursor-not-allowed'
            : 'bg-accent-500 hover:bg-accent-600 active:bg-accent-700'
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </div>
        ) : (
          <>Purchase {selectedAmount.toLocaleString()} Shobeis</>
        )}
      </button>

      <p className="text-xs text-center text-muted mt-4">
        Secure payment powered by Stripe. By purchasing you agree to our Terms of Service.
      </p>
    </div>
  );
}