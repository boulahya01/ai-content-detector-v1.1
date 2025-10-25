import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/PageHeader';
import { Link } from 'react-router-dom';

const documentationSections = [
  {
    title: 'Getting Started',
    description: 'Learn the basics of using our AI Content Detection service',
    link: '/docs/getting-started',
    icon: '📚'
  },
  {
    title: 'API Guidelines',
    description: 'Detailed API documentation and usage guidelines',
    link: '/docs/api-guidelines',
    icon: '🔧'
  },
  {
    title: 'Best Practices',
    description: 'Recommended practices for optimal content analysis',
    link: '/docs/best-practices',
    icon: '✨'
  },
  {
    title: 'Case Studies',
    description: 'Real-world examples and success stories',
    link: '/docs/case-studies',
    icon: '📈'
  },
  {
    title: 'Integration Examples',
    description: 'Code examples and integration tutorials',
    link: '/docs/integration-examples',
    icon: '💻'
  },
  {
    title: 'FAQ',
    description: 'Frequently asked questions and troubleshooting',
    link: '/docs/faq',
    icon: '❓'
  }
];

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <PageHeader
            title="Documentation"
            description="Everything you need to know about our AI Content Detection service"
          />
          <div className="mt-4 flex justify-center gap-4">
            <Link 
              to="/docs/getting-started"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-500 hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 transition-all duration-200"
            >
              Get Started →
            </Link>
            <Link 
              to="/docs/api-guidelines"
              className="inline-flex items-center justify-center px-4 py-2 border border-accent-500 rounded-md text-sm font-medium text-accent-500 hover:bg-accent-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 transition-all duration-200"
            >
              API Guidelines
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
          {documentationSections.map((section) => (
            <Link 
              key={section.title}
              to={section.link}
              className="no-underline group"
            >
              <Card className="p-8 h-full transition-all duration-300 hover:border-accent-500 hover:shadow-lg hover:scale-[1.02] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-500/50 to-accent-600/50 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                <div className="text-5xl mb-6 transform group-hover:-rotate-12 transition-transform duration-300">{section.icon}</div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-accent-500 transition-colors duration-200">{section.title}</h3>
                <p className="text-muted-foreground/80 group-hover:text-muted-foreground transition-colors duration-200">{section.description}</p>
              </Card>
            </Link>
          ))}
        </div>

        <Card className="mt-12 p-8 bg-gradient-to-br from-card to-card/90 border-accent-500/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold mb-4">Need Help?</h2>
              <p className="text-muted-foreground">
                Can't find what you're looking for? Our support team is here to help you 24/7.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/contact"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-accent-500 hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 transition-all duration-200"
              >
                Contact Support
              </Link>
              <Link 
                to="/docs/faq"
                className="inline-flex items-center justify-center px-6 py-3 border border-accent-500 rounded-md text-base font-medium text-accent-500 hover:bg-accent-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500 transition-all duration-200"
              >
                View FAQ
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}