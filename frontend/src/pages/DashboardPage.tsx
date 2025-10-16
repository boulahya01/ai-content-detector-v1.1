import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useAnalytics } from '@/context/AnalyticsContext';
import KPIOverviewCard from '@/components/dashboard/KPIOverviewCard';
import RecentActivityFeed from '@/components/dashboard/RecentActivityFeed';
import TimeTrackerCard from '@/components/dashboard/TimeTrackerCard';
import ProductivityCard from '@/components/dashboard/ProductivityCard';
import CompletedTasksCard from '@/components/dashboard/CompletedTasksCard';
import CardMenu from '@/components/ui/CardMenu';
import { exportData } from '@/utils/export';

import '@/styles/dashboard.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const { loading: analyticsLoading, userAnalytics } = useAnalytics();

  const [showName, setShowName] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowName(true), 50);
    return () => clearTimeout(t);
  }, []);

  const displayName = user
    ? [user.first_name, user.last_name].filter(Boolean).join(' ') || (user as any).name || user.email?.split('@')[0]
    : null;

  function getDayOfWeekAnalytics() {
    if (!userAnalytics) return [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      value: Math.floor(userAnalytics.analysis.total_count / 7)
    }));
  }

  return (
    <div className="content-container py-8">
      <div className="grid gap-8 md:grid-cols-2">
        {/* Welcome Section */}
        <div className="col-span-2">
          <h1 className="text-5xl font-extrabold text-accent-3 mb-3 leading-tight">
            Welcome back
            <span
              aria-live="polite"
              className={
                "ml-2 bg-clip-text text-transparent bg-gradient-to-r from-accent-3 to-accent-2 transition-all duration-500 " +
                (showName ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1')
              }
            >
              {displayName ?? 'there'}
            </span>
            <span className="inline-block ml-1 text-muted">!</span>
          </h1>
          <p className="text-lg text-muted max-w-2xl mb-6">
            Here's an overview of your AI content detection activities.
          </p>
        </div>

        {/* Dashboard cards */}
        <div className="col-span-2">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* KPI Overview */}
            <div className="lg:col-span-2">
              <KPIOverviewCard />
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <div className="dashboard-card p-6 flex flex-col gap-4 h-full">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Quick Actions</h3>
                  <div className="flex items-center gap-2">
                    <button className="card-control" aria-label="Card menu">⋯</button>
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  <Link to="/analyze" className="block">
                    <button
                      type="button"
                      className="w-full rounded-full px-8 py-3 text-lg font-bold shadow-md focus:ring-2 focus:ring-accent-300 disabled:opacity-50 disabled:cursor-not-allowed bg-[color:var(--accent-500)] text-white flex items-center"
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M6.05 17.95l-1.414 1.414m0-13.828l1.414 1.414M17.95 17.95l1.414 1.414" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 8a4 4 0 100 8 4 4 0 000-8z" /></svg>
                      <span>New Analysis</span>
                      <span className="ml-auto text-xs font-semibold bg-[color:var(--accent-2)] text-black rounded-full px-3 py-1">⌘N</span>
                    </button>
                  </Link>

                  <Link to="/history" className="block">
                    <button
                      type="button"
                      className="w-full rounded-full px-8 py-3 text-lg font-bold shadow-md focus:ring-2 focus:ring-accent-300 disabled:opacity-50 disabled:cursor-not-allowed bg-white text-black border border-white/10 flex items-center"
                    >
                      <svg className="w-5 h-5 mr-3 text-[color:var(--chart-color)]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" /></svg>
                      <span>View History</span>
                      <span className="ml-auto text-xs font-semibold bg-[color:var(--accent-2)] text-black rounded-full px-3 py-1">⌘H</span>
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* TimeTracker and RatioCard */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {userAnalytics && (
                <>
                  <TimeTrackerCard
                    series={getDayOfWeekAnalytics()}
                    totalHours={`${userAnalytics.analysis.total_count} analyses`}
                  />
                  <div className="dashboard-card p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-semibold text-white">AI vs Human Ratio</h3>
                      <div className="flex items-center gap-2">
                        <CardMenu
                          onExportCSV={() => exportData.toCSV({
                            title: 'AI-Human-Ratio',
                            data: [
                              {
                                type: 'AI',
                                percentage: Math.round((userAnalytics.analysis.ai_count / userAnalytics.analysis.total_count) * 100),
                                count: userAnalytics.analysis.ai_count
                              },
                              {
                                type: 'Human',
                                percentage: Math.round((userAnalytics.analysis.human_count / userAnalytics.analysis.total_count) * 100),
                                count: userAnalytics.analysis.human_count
                              }
                            ],
                            columns: [
                              { key: 'type', label: 'Content Type' },
                              { key: 'percentage', label: 'Percentage (%)' },
                              { key: 'count', label: 'Count' }
                            ]
                          })}
                          onExportPDF={() => exportData.toPDF({
                            title: 'AI vs Human Content Ratio',
                            data: [
                              {
                                type: 'AI',
                                percentage: Math.round((userAnalytics.analysis.ai_count / userAnalytics.analysis.total_count) * 100),
                                count: userAnalytics.analysis.ai_count
                              },
                              {
                                type: 'Human',
                                percentage: Math.round((userAnalytics.analysis.human_count / userAnalytics.analysis.total_count) * 100),
                                count: userAnalytics.analysis.human_count
                              }
                            ],
                            columns: [
                              { key: 'type', label: 'Content Type' },
                              { key: 'percentage', label: 'Percentage (%)' },
                              { key: 'count', label: 'Count' }
                            ]
                          })}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-4">
                        <span className="text-accent-3 text-2xl font-bold">
                          {Math.round((userAnalytics.analysis.ai_count / userAnalytics.analysis.total_count) * 100)}%
                        </span>
                        <span className="text-muted">AI</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-accent-1 text-2xl font-bold">
                          {Math.round((userAnalytics.analysis.human_count / userAnalytics.analysis.total_count) * 100)}%
                        </span>
                        <span className="text-muted">Human</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Right column stacked cards */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {userAnalytics && (
                <>
                  <ProductivityCard
                    kpi={userAnalytics.analysis.avg_confidence * 100}
                    slices={[
                      { label: 'AI', value: userAnalytics.analysis.ai_count },
                      { label: 'Human', value: userAnalytics.analysis.human_count },
                    ]}
                  />
                  <CompletedTasksCard
                    total={userAnalytics.analysis.total_count}
                    percent={(userAnalytics.analysis.ai_count / userAnalytics.analysis.total_count) * 100}
                    series={getDayOfWeekAnalytics()}
                  />
                  <RecentActivityFeed />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}