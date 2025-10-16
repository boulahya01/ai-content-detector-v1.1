import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';
import { exportData } from '@/utils/export';
import CardMenu from '@/components/ui/CardMenu';


export interface CompletedTaskPoint {
  day: string;
  value: number;
}

export interface CompletedTasksCardProps {
  total: number;
  percent: number;
  series: CompletedTaskPoint[];
}

export default function CompletedTasksCard({ total, percent, series }: CompletedTasksCardProps) {
  return (
    <div className="dashboard-card p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">Analysis Trend</h3>
        <div className="flex items-center gap-2">
          <CardMenu
            onExportCSV={() => exportData.toCSV({
              title: 'Analysis-Trend',
              data: series,
              columns: [
                { key: 'day', label: 'Day' },
                { key: 'value', label: 'Analyses' }
              ]
            })}
            onExportPDF={() => exportData.toPDF({
              title: 'Analysis Trend',
              data: series,
              columns: [
                { key: 'day', label: 'Day' },
                { key: 'value', label: 'Analyses' }
              ]
            })}
          />
        </div>
      </div>

      <div className="text-3xl font-bold text-white mb-2">{total}</div>
      <div className="text-sm text-muted mb-4">Total Analyses <span className="text-accent-1">{percent.toFixed(2)}% AI</span></div>

      <div style={{ height: 120 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ left: -16, right: 8 }}>
            <XAxis dataKey="day" tick={{ fill: 'var(--muted)' }} />
            <YAxis hide />
            <Tooltip wrapperStyle={{ background: 'var(--card-surface)', borderRadius: 8, color: 'var(--text-color)' }} />
            <Line dataKey="value" stroke="var(--chart-color)" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
