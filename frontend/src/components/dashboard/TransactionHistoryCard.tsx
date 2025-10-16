import React, { useEffect } from 'react';
import { useShobeis } from '@/context/ShobeisContext';
import CardMenu from '@/components/ui/CardMenu';
import { exportData } from '@/utils/export';

const TRANSACTION_ICONS: Record<string, React.ReactNode> = {
  analysis: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  ),
  purchase: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
    </svg>
  ),
  bonus: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  ),
  refund: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
    </svg>
  ),
  refresh: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  )
};

function getTransactionIcon(type: string) {
  return TRANSACTION_ICONS[type] || TRANSACTION_ICONS.analysis;
}

function formatAmount(amount: number) {
  return (
    <span className={amount >= 0 ? 'text-accent-300' : 'text-red-500'}>
      {amount >= 0 ? '+' : ''}{amount.toLocaleString()} ₴
    </span>
  );
}

export function TransactionHistoryCard() {
  const { transactions, fetchTransactions, loading, error } = useShobeis();

  useEffect(() => {
    fetchTransactions({ limit: 10 });
  }, [fetchTransactions]);

  return (
    <div className="dashboard-card p-6">
      <div className="flex items-start justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Recent Transactions</h3>
        <CardMenu 
          onExportCSV={() => exportData.toCSV({
            title: 'Shobeis-Transactions',
            data: transactions,
            columns: [
              { key: 'type', label: 'Type' },
              { key: 'amount', label: 'Amount' },
              { key: 'created_at', label: 'Date' }
            ]
          })}
          onExportPDF={() => exportData.toPDF({
            title: 'Shobeis Transactions',
            data: transactions,
            columns: [
              { key: 'type', label: 'Type' },
              { key: 'amount', label: 'Amount' },
              { key: 'created_at', label: 'Date' }
            ]
          })}
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 animate-pulse">
              <div className="w-10 h-10 bg-accent-500/10 rounded-full" />
              <div className="flex-1">
                <div className="h-4 w-1/4 bg-accent-500/10 rounded mb-2" />
                <div className="h-3 w-1/3 bg-accent-500/10 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-red-500 bg-red-500/10 rounded-lg p-4">
          <p>{error}</p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-accent-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-1">No Transactions Yet</h3>
          <p className="text-sm text-muted">Start analyzing content to see your transactions here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent-500/5 transition-colors">
              <div className="w-10 h-10 rounded-full bg-accent-500/10 text-accent-300 flex items-center justify-center">
                {getTransactionIcon(transaction.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white truncate">
                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                  </p>
                  <p className="text-sm font-semibold">
                    {formatAmount(transaction.amount)}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-muted truncate">
                    {transaction.meta?.description || `Transaction #${transaction.id.slice(0, 8)}`}
                  </p>
                  <p className="text-xs text-muted">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {transactions.length >= 10 && (
            <button
              onClick={() => fetchTransactions({ limit: 20 })}
              className="w-full mt-4 py-2 text-sm text-accent-300 hover:text-accent-200 transition-colors"
            >
              Load More
            </button>
          )}
        </div>
      )}
    </div>
  );
}