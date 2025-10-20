import { useState } from 'react';
import { FiBarChart2, FiPieChart, FiCalendar } from 'react-icons/fi';

interface UsageData {
  date: string;
  analyses: number;
  credits: number;
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
  }>;
}

const MOCK_USAGE_DATA: UsageData[] = [
  { date: '2023-10-01', analyses: 25, credits: 75 },
  { date: '2023-10-02', analyses: 30, credits: 70 },
  { date: '2023-10-03', analyses: 15, credits: 85 },
  { date: '2023-10-04', analyses: 40, credits: 60 },
  { date: '2023-10-05', analyses: 20, credits: 80 },
  { date: '2023-10-06', analyses: 35, credits: 65 },
  { date: '2023-10-07', analyses: 28, credits: 72 },
];

export default function UsageStats() {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week');

  return (
    <div className="space-y-8">
      {/* Usage Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl border border-white/10 bg-white/5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-accent-500/20 flex items-center justify-center">
              <FiBarChart2 className="w-5 h-5 text-accent-300" />
            </div>
            <div>
              <p className="text-sm text-white/60">Total Analyses</p>
              <p className="text-2xl font-bold text-white/90">193</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-white/10 bg-white/5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-accent-500/20 flex items-center justify-center">
              <FiPieChart className="w-5 h-5 text-accent-300" />
            </div>
            <div>
              <p className="text-sm text-white/60">Credits Used</p>
              <p className="text-2xl font-bold text-white/90">507</p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-white/10 bg-white/5">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-accent-500/20 flex items-center justify-center">
              <FiCalendar className="w-5 h-5 text-accent-300" />
            </div>
            <div>
              <p className="text-sm text-white/60">Average Daily Usage</p>
              <p className="text-2xl font-bold text-white/90">27.6</p>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Chart */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white/90">Usage Over Time</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTimeframe('week')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                timeframe === 'week'
                  ? 'bg-accent-500 text-white'
                  : 'text-white/60 hover:text-white/90'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeframe('month')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                timeframe === 'month'
                  ? 'bg-accent-500 text-white'
                  : 'text-white/60 hover:text-white/90'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeframe('year')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                timeframe === 'year'
                  ? 'bg-accent-500 text-white'
                  : 'text-white/60 hover:text-white/90'
              }`}
            >
              Year
            </button>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-white/10 bg-white/5">
          <div className="h-[300px] flex items-center justify-center text-white/40">
            Chart placeholder - Implement with your preferred charting library
          </div>
        </div>
      </div>

      {/* Usage History */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white/90">Usage History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-white/10">
                <th className="pb-3 font-medium text-white/70">Date</th>
                <th className="pb-3 font-medium text-white/70">Analyses</th>
                <th className="pb-3 font-medium text-white/70">Credits</th>
              </tr>
            </thead>
            <tbody className="text-white/90">
              {MOCK_USAGE_DATA.map((day) => (
                <tr key={day.date}>
                  <td className="py-3">{new Date(day.date).toLocaleDateString()}</td>
                  <td>{day.analyses}</td>
                  <td>{day.credits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}