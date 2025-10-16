import { useShobeis } from '@/context/ShobeisContext';
import { cn } from '@/utils/cn';

export function ShobeisBalanceCard() {
  const { balance, loading, error } = useShobeis();

  return (
    <div className="dashboard-card p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">Shobeis Balance</h3>
        <div className="flex items-center gap-2">
          <div className="text-xs bg-accent-500/10 text-accent-300 px-3 py-1 rounded-full">
            {balance?.subscription_tier ?? 'Free'}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-1/3 bg-accent-500/10 rounded" />
          <div className="h-4 w-1/2 bg-accent-500/10 rounded" />
        </div>
      ) : error ? (
        <div className="text-red-500 bg-red-500/10 rounded-lg p-4">
          <p>{error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col">
            <span className="text-4xl font-bold text-white">
              {balance?.amount.toLocaleString()} <span className="text-accent-300">₴</span>
            </span>
            <span className="text-sm text-muted mt-1">Available Shobeis</span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-white">
                {balance?.monthly_refresh_amount.toLocaleString()} <span className="text-accent-300">₴</span>
              </span>
              <span className="text-sm text-muted mt-1">Monthly Refresh</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-white">
                {balance?.bonus_balance.toLocaleString()} <span className="text-accent-300">₴</span>
              </span>
              <span className="text-sm text-muted mt-1">Bonus Balance</span>
            </div>
          </div>

          {/* Next refresh countdown */}
          {balance?.last_refresh_date && (
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Next Refresh</span>
                <span className="text-sm font-medium text-accent-300">
                  {new Date(balance.last_refresh_date).toLocaleDateString()}
                </span>
              </div>
              <div className="mt-2 w-full bg-accent-500/10 rounded-full h-2">
                <div 
                  className={cn(
                    "h-full bg-accent-500 rounded-full transition-all duration-500",
                    "relative before:absolute before:inset-0 before:bg-accent-300/20 before:animate-pulse"
                  )}
                  style={{
                    width: `${getRefreshProgress(balance.last_refresh_date)}%`
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function getRefreshProgress(lastRefreshDate: string): number {
  const now = new Date();
  const last = new Date(lastRefreshDate);
  const nextRefresh = new Date(last.getFullYear(), last.getMonth() + 1, 1);
  const totalDays = (nextRefresh.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
  const daysElapsed = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
  return Math.min(100, Math.max(0, (daysElapsed / totalDays) * 100));
}