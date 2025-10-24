import React from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

interface PricingTier {
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  credits: number;
  recommended?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    name: 'Free',
    price: 0,
    interval: 'month',
    credits: 5,
    features: [
      '5 free credits',
      'Basic AI detection',
      'Up to 1000 words per analysis',
      'Standard support'
    ]
  },
  {
    name: 'Pro',
    price: 9.99,
    interval: 'month',
    credits: 100,
    recommended: true,
    features: [
      '100 credits per month',
      'Advanced AI detection',
      'Up to 5000 words per analysis',
      'Priority support',
      'API access',
      'Detailed reports',
      'Batch processing'
    ]
  },
  {
    name: 'Enterprise',
    price: 49.99,
    interval: 'month',
    credits: 1000,
    features: [
      '1000 credits per month',
      'Enterprise AI detection',
      'Unlimited words per analysis',
      '24/7 priority support',
      'Custom API integration',
      'Advanced analytics',
      'Custom features',
      'Team management'
    ]
  }
];

export const PricingTable: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubscribe = async (tier: PricingTier) => {
    try {
      // Handle subscription logic here
      console.log('Subscribe to', tier.name);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process subscription. Please try again.',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="w-full px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col rounded-2xl border p-8 shadow-sm ${
                tier.recommended
                  ? 'border-primary ring-2 ring-primary'
                  : 'border-border'
              }`}
            >
              {tier.recommended && (
                <div className="absolute -top-4 left-0 right-0">
                  <div className="mx-auto w-fit rounded-full bg-primary px-4 py-1 text-sm font-medium text-primary-foreground">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold">{tier.name}</h3>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-bold">${tier.price}</span>
                  <span className="ml-1 text-muted-foreground">
                    /{tier.interval}
                  </span>
                </div>
              </div>

              <ul className="mb-6 space-y-4 text-sm">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <svg
                      className="mr-3 h-5 w-5 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                <Button
                  className="w-full"
                  variant={tier.recommended ? 'default' : 'outline'}
                  onClick={() => handleSubscribe(tier)}
                >
                  {tier.price === 0
                    ? 'Get Started'
                    : user
                    ? 'Subscribe Now'
                    : 'Sign Up'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};