import React from 'react';
import PlanCard from '@/components/subscription/PlanCard';
import { useSubscription } from '@/hooks/useSubscription';

const plans = [
  {
    title: 'Free',
    price: '$0',
    period: 'month',
    description: 'Perfect for trying out our AI detection capabilities',
    creditsPerMonth: 10,
    features: [
      { name: 'Basic text analysis', included: true },
      { name: 'Up to 1000 words per analysis', included: true },
      { name: 'Email support', included: true },
      { name: 'Basic accuracy reports', included: true },
      { name: 'API access', included: false },
      { name: 'Priority processing', included: false },
    ],
    buttonText: 'Get Started',
  },
  {
    title: 'Pro',
    price: '$19',
    period: 'month',
    description: 'Advanced features for professionals and small teams',
    creditsPerMonth: 100,
    isPopular: true,
    features: [
      { name: 'Advanced text analysis', included: true },
      { name: 'Up to 5000 words per analysis', included: true },
      { name: 'Priority email & chat support', included: true },
      { name: 'Detailed accuracy reports', included: true },
      { name: 'Basic API access', included: true },
      { name: 'Priority processing', included: true },
      { name: 'Bulk analysis', included: true },
    ],
    buttonText: 'Start Pro Trial',
  },
  {
    title: 'Enterprise',
    price: 'Custom',
    period: 'year',
    description: 'Customized solutions for large organizations',
    creditsPerMonth: 1000,
    features: [
      { name: 'Custom API integration', included: true },
      { name: 'Unlimited words per analysis', included: true },
      { name: 'Dedicated support manager', included: true },
      { name: 'Custom accuracy models', included: true },
      { name: 'White-label options', included: true },
      { name: 'Advanced analytics', included: true },
      { name: 'Custom features', included: true },
    ],
    buttonText: 'Contact Sales',
    comingSoon: true,
  },
];

export default function PricingPage() {
  const { updateSubscription } = useSubscription();

  return (
    <div className="min-h-screen w-full py-16">
      {/* Header Section - Centered Title */}
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
          Choose Your Plan
        </h1>
        <p className="text-lg text-white/80 max-w-2xl mx-auto">
          Get accurate AI content detection with our flexible pricing plans
        </p>
      </div>

      {/* Plans Section - Three cards in ONE row */}
      <div className="w-full px-8">
        <div className="flex flex-row justify-center items-stretch gap-12 mb-24">
          {plans.map((plan) => (
            <div
              key={plan.title}
              className="w-1/3 max-w-xl"
            >
              <PlanCard
                {...plan}
                onSelect={() => {
                  if (!plan.comingSoon) {
                    updateSubscription(plan.title.toLowerCase());
                  }
                }}
              />
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid gap-6">
            <div className="border-b border-white/10 pb-6">
              <h3 className="text-lg font-medium text-white">
                What are credits?
              </h3>
              <p className="mt-2 text-white/70">
                Credits are used for each analysis you perform. One credit equals
                one analysis of up to the word limit for your plan.
              </p>
            </div>
            <div className="border-b border-white/10 pb-6">
              <h3 className="text-lg font-medium text-white">
                Do credits roll over?
              </h3>
              <p className="mt-2 text-white/70">
                Credits reset monthly and do not roll over to the next month. Make
                the most of your credits within your billing cycle.
              </p>
            </div>
            <div className="border-b border-white/10 pb-6">
              <h3 className="text-lg font-medium text-white">
                Can I upgrade anytime?
              </h3>
              <p className="mt-2 text-white/70">
                Yes! You can upgrade your plan at any time. The new features and
                credits will be available immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}