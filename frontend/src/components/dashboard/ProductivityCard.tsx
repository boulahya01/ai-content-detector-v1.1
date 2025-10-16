import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { exportData } from '@/utils/export';
import CardMenu from '@/components/ui/CardMenu';


export interface DistributionSlice {
  label: string;
  value: number;
  [key: string]: string | number; // Add index signature for chart compatibility
}

export interface ProductivityCardProps {
  kpi: number;
  slices: DistributionSlice[];
}

export default function ProductivityCard({ kpi, slices }: ProductivityCardProps) {
  const COLORS = ['var(--chart-color)', 'var(--card-surface)'];
  return (
    <div className="dashboard-card p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">Analysis Distribution</h3>
        <div className="flex items-center gap-2">
          <CardMenu
            onExportCSV={() => exportData.toCSV({
              title: 'Analysis-Distribution',
              data: slices,
              columns: [
                { key: 'label', label: 'Category' },
                { key: 'value', label: 'Count' }
              ]
            })}
            onExportPDF={() => exportData.toPDF({
              title: 'Analysis Distribution',
              data: slices,
              columns: [
                { key: 'label', label: 'Category' },
                { key: 'value', label: 'Count' }
              ]
            })}
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div>
          <div className="text-3xl font-bold text-white">{kpi.toFixed(2)}%</div>
          <div className="text-sm text-muted mt-1">Workload KPI</div>
        </div>
        <div style={{ width: 120, height: 120 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={slices} dataKey="value" innerRadius={36} outerRadius={54} startAngle={90} endAngle={-270}>
                {slices.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
