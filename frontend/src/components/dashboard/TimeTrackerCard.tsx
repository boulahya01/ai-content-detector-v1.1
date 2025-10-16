import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import CardMenu from '@/components/ui/CardMenu';
import { exportData } from '@/utils/export';


// Accepts analytics series and KPI as props for backend wiring
export interface TrendPoint {
  day: string;
  value: number;
  [key: string]: string | number; // Add index signature for chart compatibility
}

export interface TimeTrackerProps {
  series: TrendPoint[];
  totalHours: string;
}

export default function TimeTrackerCard({ series, totalHours }: TimeTrackerProps) {
  return (
    <div className="dashboard-card p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-2xl font-semibold text-white">Analysis Volume</h3>
        <div className="flex items-center gap-2">
          <button className="card-control" aria-label="Expand chart">⤢</button>
          <CardMenu
            onExportCSV={() => exportData.toCSV({
              title: 'Analysis-Volume',
              data: series,
              columns: [
                { key: 'day', label: 'Day' },
                { key: 'value', label: 'Analyses' }
              ]
            })}
            onExportPDF={() => exportData.toPDF({
              title: 'Analysis Volume',
              data: series,
              columns: [
                { key: 'day', label: 'Day' },
                { key: 'value', label: 'Analyses' }
              ]
            })}
          />
        </div>
      </div>

      <div style={{ height: 300 }} className="-mx-4 px-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={series} margin={{ top: 20, right: 32, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis dataKey="day" tick={{ fill: 'var(--muted)' }} />
            <YAxis tick={{ fill: 'var(--muted)' }} />
            <Tooltip wrapperStyle={{ background: 'var(--card-surface)', borderRadius: 8, color: 'var(--text-color)' }} />
            <Bar dataKey="value" fill="var(--chart-color)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 text-muted">
        <div className="text-sm text-accent-3">Total Analyses</div>
        <div className="text-3xl font-bold">{totalHours}</div>
      </div>
    </div>
  );
}
