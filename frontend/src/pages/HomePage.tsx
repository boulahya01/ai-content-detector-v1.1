
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { CheckmarkIcon, LightningIcon, ChartBarIcon } from '@/components/ui/icons';

interface Feature {
  name: string;
  description: string;
  icon: React.ReactNode;
}

export default function HomePage(): React.ReactNode {
  const { user } = useAuth();

  return (
    <div className="relative isolate">
      {/* Background */}
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>

      {/* Hero Content */}
      <div className="px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Detect AI-Generated Content with Confidence
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Our advanced AI detection system helps you identify machine-generated content
              with high accuracy. Perfect for content managers, educators, and publishers.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              {user ? (
                <Link to="/analyze">
                  <Button size="lg">Start Analysis</Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button size="lg">Get Started</Button>
                  </Link>

                  <Link to="/pricing">
                    <Button variant="outline" size="lg">
                      View Pricing <span aria-hidden="true">→</span>
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">
            Advanced Detection
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to verify content authenticity
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Our platform combines multiple detection methods to provide accurate and
            reliable results for identifying AI-generated content.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  {feature.icon}
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

const features: Feature[] = [
  {
    name: 'High Accuracy',
    description:
      'Our advanced algorithms provide industry-leading accuracy in detecting AI-generated content.',
    icon: <CheckmarkIcon className="w-6 h-6 text-indigo-600" />,
  },
  {
    name: 'Fast Analysis',
    description:
      'Get results in seconds, not minutes. Our optimized system processes content quickly without sacrificing accuracy.',
    icon: <LightningIcon className="w-6 h-6 text-indigo-600" />,
  },
  {
    name: 'Detailed Reports',
    description:
      'Get comprehensive reports with confidence scores, analysis breakdowns, and recommendations.',
    icon: <ChartBarIcon className="w-6 h-6 text-indigo-600" />,
  },
];