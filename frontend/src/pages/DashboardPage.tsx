import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
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
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's an overview of your AI content detection activities.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Subscription Status
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Current Plan</p>
              <p className="text-xl font-medium text-gray-900">
                {subscription?.planType || 'Free'} Plan
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Analyses Remaining</p>
              <p className="text-xl font-medium text-gray-900">
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
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
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
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Recent Analyses
              </h2>
              <Link
                to="/history"
                className="text-sm text-primary hover:text-primary/80"
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
                        <p className="text-sm font-medium text-gray-900">
                          {analysis.contentPreview.substring(0, 100)}...
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Score: {analysis.authenticityScore * 100}%
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        analysis.confidenceLevel === 'high'
                          ? 'bg-red-100 text-red-800'
                          : analysis.confidenceLevel === 'medium'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {analysis.confidenceLevel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
                No analyses performed yet.{' '}
                <Link to="/analyze" className="text-primary hover:underline">
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