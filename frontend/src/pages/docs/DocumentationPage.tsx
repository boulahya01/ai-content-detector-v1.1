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
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Documentation"
        description="Everything you need to know about our AI Content Detection service"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {documentationSections.map((section) => (
          <Link 
            key={section.title}
            to={section.link}
            className="no-underline"
          >
            <Card className="p-6 h-full transition-all duration-200 hover:border-accent-500 hover:shadow-lg">
              <div className="text-4xl mb-4">{section.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{section.title}</h3>
              <p className="text-muted-foreground">{section.description}</p>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="mt-8 p-6">
        <h2 className="text-xl font-semibold mb-4">Need Help?</h2>
        <p className="text-muted-foreground mb-4">
          Can't find what you're looking for? Our support team is here to help.
        </p>
        <Link 
          to="/contact"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-500 hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
        >
          Contact Support
        </Link>
      </Card>
    </div>
  );
}