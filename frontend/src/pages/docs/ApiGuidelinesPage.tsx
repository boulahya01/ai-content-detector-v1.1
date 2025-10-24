import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/PageHeader';
import { CodeBlock } from '@/components/CodeBlock';

const apiGuidelinesSections = [
  {
    title: 'Authentication',
    content: `To authenticate your requests, include your API key in the Authorization header:

curl -X POST https://api.aicontentdetector.com/v1/analyze \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Your content here"}'`,
    language: 'bash'
  },
  {
    title: 'Rate Limits',
    content: `- Free tier: 100 requests per day
- Pro tier: 1,000 requests per day
- Enterprise tier: Custom limits

Rate limit headers are included in all API responses:
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1621123200`
  },
  {
    title: 'Request Format',
    content: `{
  "text": "Content to analyze",
  "language": "en",  // optional
  "detail_level": "basic"  // basic or detailed
}`,
    language: 'json'
  },
  {
    title: 'Response Format',
    content: `{
  "result": {
    "score": 0.92,
    "classification": "AI_GENERATED",
    "confidence": "HIGH",
    "details": {
      "markers": [...],
      "explanations": [...]
    }
  },
  "request_id": "req_abc123",
  "processing_time": "0.234s"
}`,
    language: 'json'
  }
];

export default function ApiGuidelinesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="API Guidelines"
        description="Complete reference for integrating with our AI Content Detection API"
      />

      <div className="space-y-8 mt-8">
        {apiGuidelinesSections.map((section) => (
          <Card key={section.title} className="p-6">
            <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
            {section.language ? (
              <CodeBlock
                code={section.content}
                language={section.language}
              />
            ) : (
              <div className="prose prose-invert max-w-none">
                <pre className="whitespace-pre-wrap font-mono text-sm bg-card p-4 rounded-md">
                  {section.content}
                </pre>
              </div>
            )}
          </Card>
        ))}
      </div>

      <Card className="mt-8 p-6">
        <h2 className="text-xl font-semibold mb-4">Need More Help?</h2>
        <p className="text-muted-foreground">
          For more detailed information, edge cases, or specific integrations,
          please refer to our complete API documentation or contact our support team.
        </p>
      </Card>
    </div>
  );
}