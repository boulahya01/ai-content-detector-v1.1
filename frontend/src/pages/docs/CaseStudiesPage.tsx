import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/PageHeader';

const caseStudies = [
  {
    title: 'Educational Institution',
    industry: 'Education',
    challenge: 'Needed to verify student submissions for AI-generated content',
    solution: 'Integrated AI content detection API into their learning management system',
    results: [
      '90% reduction in AI-generated submissions',
      'Increased academic integrity',
      'Streamlined grading process'
    ]
  },
  {
    title: 'Content Publishing Platform',
    industry: 'Media',
    challenge: 'Required automatic screening of user-submitted articles',
    solution: 'Implemented real-time content analysis using our API',
    results: [
      'Improved content quality',
      'Reduced moderation time by 75%',
      'Enhanced user trust'
    ]
  },
  {
    title: 'Digital Marketing Agency',
    industry: 'Marketing',
    challenge: 'Needed to verify authenticity of content from freelancers',
    solution: 'Integrated content detection into their content management workflow',
    results: [
      'Improved content originality',
      'Better client satisfaction',
      'Streamlined quality control'
    ]
  }
];

export default function CaseStudiesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Case Studies"
        description="Real-world applications and success stories of our AI Content Detection service"
      />

      <div className="space-y-6 mt-8">
        {caseStudies.map((study) => (
          <Card key={study.title} className="p-6">
            <div className="flex flex-col md:flex-row justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">{study.title}</h2>
                <p className="text-accent-500 mb-4">Industry: {study.industry}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">Challenge</h3>
                <p className="text-muted-foreground">{study.challenge}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg">Solution</h3>
                <p className="text-muted-foreground">{study.solution}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg">Results</h3>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {study.results.map((result, index) => (
                    <li key={index}>{result}</li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-8 p-6">
        <h2 className="text-xl font-semibold mb-4">Share Your Success Story</h2>
        <p className="text-muted-foreground">
          Are you using our AI Content Detection service in an interesting way?
          We'd love to hear about it and potentially feature your case study.
        </p>
        <button className="mt-4 px-4 py-2 bg-accent-500 text-white rounded-md hover:bg-accent-600 transition-colors">
          Submit Your Story
        </button>
      </Card>
    </div>
  );
}