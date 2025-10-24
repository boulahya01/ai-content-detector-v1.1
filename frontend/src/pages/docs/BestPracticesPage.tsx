import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/PageHeader';

const bestPractices = [
  {
    title: 'Content Length',
    description: 'For optimal analysis, provide content between 100 and 5000 characters. Longer texts can be split into multiple requests.',
    tips: [
      'Minimum: 100 characters',
      'Optimal: 500-2000 characters',
      'Maximum per request: 5000 characters'
    ]
  },
  {
    title: 'Rate Limiting',
    description: 'Implement proper rate limiting in your application to avoid hitting API limits.',
    tips: [
      'Use exponential backoff for retries',
      'Cache responses when possible',
      'Monitor your usage with usage stats',
      'Set up alerts for rate limit warnings'
    ]
  },
  {
    title: 'Error Handling',
    description: 'Implement robust error handling to manage API responses and maintain application stability.',
    tips: [
      'Handle all HTTP status codes',
      'Implement retry logic for 5xx errors',
      'Log detailed error information',
      'Show user-friendly error messages'
    ]
  },
  {
    title: 'Performance Optimization',
    description: 'Optimize your integration for best performance and user experience.',
    tips: [
      'Batch requests when possible',
      'Implement client-side caching',
      'Use webhook notifications for long operations',
      'Compress request payloads'
    ]
  }
];

export default function BestPracticesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Best Practices"
        description="Guidelines for optimal use of our AI Content Detection service"
      />

      <div className="space-y-6 mt-8">
        {bestPractices.map((practice) => (
          <Card key={practice.title} className="p-6">
            <h2 className="text-xl font-semibold mb-2">{practice.title}</h2>
            <p className="text-muted-foreground mb-4">{practice.description}</p>
            <ul className="list-disc list-inside space-y-2">
              {practice.tips.map((tip, index) => (
                <li key={index} className="text-muted-foreground">
                  {tip}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <Card className="mt-8 p-6">
        <h2 className="text-xl font-semibold mb-4">Need More Information?</h2>
        <p className="text-muted-foreground">
          These best practices are continually updated based on user feedback and platform improvements.
          Check back regularly for new recommendations and optimizations.
        </p>
      </Card>
    </div>
  );
}