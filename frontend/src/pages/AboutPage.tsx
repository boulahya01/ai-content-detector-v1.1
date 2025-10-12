import { Card } from '@/components/ui/Card';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          About AI Content Detector
        </h1>
        <p className="text-xl text-gray-600">
          Empowering content authenticity through advanced AI detection
        </p>
      </div>

      {/* Mission Section */}
      <Card className="mb-8 p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
        <p className="text-gray-600 mb-6">
          We're dedicated to maintaining the integrity of online content by providing cutting-edge AI detection tools. 
          Our mission is to help content creators, educators, and publishers ensure the authenticity of their content 
          in an increasingly AI-driven world.
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Fast Detection</h3>
            <p className="text-sm text-gray-600">Quick and accurate content analysis in seconds</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Reliable Results</h3>
            <p className="text-sm text-gray-600">Advanced algorithms for trustworthy analysis</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-2">Secure Platform</h3>
            <p className="text-sm text-gray-600">Your content privacy is our priority</p>
          </div>
        </div>
      </Card>

      {/* Team Section */}
      <Card className="mb-8 p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Technology</h2>
        <p className="text-gray-600 mb-6">
          Our AI content detection system uses state-of-the-art machine learning models trained on vast datasets 
          of human and AI-generated content. We continuously improve our algorithms to stay ahead of advancing 
          AI text generation technologies.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-3">Detection Features</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-600">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Pattern Analysis
              </li>
              <li className="flex items-center text-gray-600">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Linguistic Analysis
              </li>
              <li className="flex items-center text-gray-600">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Contextual Understanding
              </li>
            </ul>
          </div>

          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="font-semibold text-lg mb-3">Accuracy Metrics</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-gray-600">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                95%+ Detection Accuracy
              </li>
              <li className="flex items-center text-gray-600">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Low False Positive Rate
              </li>
              <li className="flex items-center text-gray-600">
                <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Real-time Processing
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Contact Section */}
      <Card className="p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Get in Touch</h2>
        <p className="text-gray-600 mb-6">
          Have questions about our technology or interested in enterprise solutions? We'd love to hear from you.
        </p>
        <a 
          href="/contact" 
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Contact Us
        </a>
      </Card>
    </div>
  );
}