import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useAnalysisHistory } from '@/hooks/useAnalyzer';
import { Button } from '@/components/ui/Button';

export default function DashboardPage() {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const { history, isLoading } = useAnalysisHistory();

  const recentAnalyses = history?.slice(0, 5) || [];

  return (
    <div className="content-container py-8">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Welcome Section */}
        <div className="col-span-2">
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-2 text-white/70">
            Here's an overview of your AI content detection activities.
          </p>
        </div>

        {/* Quick Stats */}
  <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">
            Subscription Status
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-white/70">Current Plan</p>
              <p className="text-xl font-medium text-white">
                {subscription?.planType || 'Free'} Plan
              </p>
            </div>
            <div>
              <p className="text-sm text-white/70">Analyses Remaining</p>
              <p className="text-xl font-medium text-white">
                {subscription?.analysisLimit || 0} credits
              </p>
            </div>
            <Link to="/pricing">
              <Button variant="outline" className="w-full">
                Upgrade Plan
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
  <div className="card">
          <h2 className="text-lg font-semibold text-white mb-4">
            Quick Actions
          </h2>
          <div className="space-y-4">
            <Link to="/analyze">
              <Button className="w-full">New Analysis</Button>
            </Link>
            <Link to="/history">
              <Button variant="outline" className="w-full">
                View History
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Analyses */}
        <div className="col-span-2">
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">
                Recent Analyses
              </h2>
              <Link
                to="/history"
                className="text-sm text-white hover:text-white/80"
              >
                View all
              </Link>
            </div>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : recentAnalyses.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {recentAnalyses.map((analysis) => (
                  <div key={analysis.id} className="py-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {analysis.contentPreview.substring(0, 100)}...
                        </p>
                        <p className="text-sm text-white/70 mt-1">
                          Score: {analysis.authenticityScore * 100}%
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-xl border ${
                        analysis.confidenceLevel === 'high'
                          ? 'border-red-500 text-red-500'
                          : analysis.confidenceLevel === 'medium'
                          ? 'border-yellow-500 text-yellow-500'
                          : 'border-green-500 text-green-500'
                      }`}>
                        {analysis.confidenceLevel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-white/70 py-8">
                No analyses performed yet.{' '}
                <Link to="/analyze" className="text-white hover:text-white/80 underline">
                  Start your first analysis
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}