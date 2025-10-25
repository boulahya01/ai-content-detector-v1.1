import { useAnalytics } from '@/context/AnalyticsContext';
import { Button } from '@/components/ui/Button';

function convertToCSV(objArray: any[]) {
  const array = typeof objArray !== 'object' ? JSON.parse(objArray) : objArray;
  let str = '';
  const keys = Object.keys(array[0] || {});
  str += keys.join(',') + '\n';
  for (let i = 0; i < array.length; i++) {
    let line = '';
    for (let j = 0; j < keys.length; j++) {
      if (line !== '') line += ',';
      line += array[i][keys[j]];
    }
    str += line + '\n';
  }
  return str;
}

export default function ExportAnalyticsButton() {
  const { userAnalytics } = useAnalytics();

  const handleExport = () => {
    if (!userAnalytics) return;
    const rows = [
      {
        id: userAnalytics.user.id,
        subscription_tier: userAnalytics.user.subscription_tier,
        credits_used: userAnalytics.user.credits_used,
        credits_total: userAnalytics.user.credits_total,
        total_analyses: userAnalytics.analysis.total_count,
        ai_count: userAnalytics.analysis.ai_count,
        human_count: userAnalytics.analysis.human_count,
        avg_confidence: userAnalytics.analysis.avg_confidence,
        avg_processing_time: userAnalytics.analysis.avg_processing_time,
      },
      ...userAnalytics.api_usage.map((usage) => ({
        endpoint: usage.endpoint,
        request_count: usage.request_count,
        success_rate: usage.success_rate,
        avg_response_time: usage.avg_response_time,
      }))
    ];
    const csv = convertToCSV(rows);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analytics.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="secondary"
      onClick={handleExport}
      disabled={!userAnalytics}
      className="mt-4"
    >
      Export Analytics (CSV)
    </Button>
  );
}
