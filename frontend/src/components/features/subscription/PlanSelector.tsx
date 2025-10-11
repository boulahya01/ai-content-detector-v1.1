import React from 'react';
import { Plan } from '../../../types';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';

const AVAILABLE_PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    description: 'Perfect for individual users',
    monthlyPrice: 9.99,
    yearlyPrice: 99.99,
    features: [
      'Up to 100 analyses per month',
      'Basic file formats support',
      'Standard response time',
      'Email support'
    ],
    analysisLimit: 100,
    isPopular: false
  },
  {
    id: 'pro',
    name: 'Professional',
    description: 'For power users and teams',
    monthlyPrice: 29.99,
    yearlyPrice: 299.99,
    features: [
      'Unlimited analyses',
      'All file formats supported',
      'Priority processing',
      'Priority support',
      'Advanced analytics',
      'Team collaboration'
    ],
    analysisLimit: -1,
    isPopular: true
  }
];

export interface PlanSelectorProps {
  currentPlan?: 'basic' | 'pro';
  onSelect: (plan: Plan) => void;
}

export const PlanSelector: React.FC<PlanSelectorProps> = ({
  currentPlan,
  onSelect,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {AVAILABLE_PLANS.map((plan) => (
        <Card
          key={plan.id}
          className={`relative ${
            plan.isPopular ? 'border-2 border-blue-500' : ''
          }`}
        >
          {plan.isPopular && (
            <div className="absolute top-0 right-0 -translate-y-1/2 px-3 py-1 bg-blue-500 text-white text-sm rounded-full">
              Popular
            </div>
          )}

          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
              <p className="mt-1 text-gray-500">{plan.description}</p>
            </div>

            <div>
              <p className="flex items-baseline">
                <span className="text-4xl font-bold text-gray-900">
                  ${plan.monthlyPrice}
                </span>
                <span className="ml-1 text-gray-500">/month</span>
              </p>
              <p className="mt-1 text-sm text-gray-500">
                or ${plan.yearlyPrice}/year
              </p>
            </div>

            <ul className="space-y-3">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg
                    className="h-5 w-5 text-green-500 mt-0.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="ml-3 text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => onSelect(plan)}
              disabled={plan.id === currentPlan}
              variant={plan.isPopular ? 'default' : 'outline'}
              className="w-full"
            >
              {plan.id === currentPlan ? 'Current Plan' : 'Select Plan'}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default PlanSelector;