import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { formStyles } from '@/components/auth/styles';
import {
  FiCreditCard,
  FiCalendar,
  FiDollarSign,
  FiActivity,
  FiPackage,
  FiCheck,
  FiX
} from 'react-icons/fi';

interface BillingPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  creditsPerInterval: number;
  isPopular?: boolean;
}

const BILLING_PLANS: BillingPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    interval: 'month',
    features: [
      '100 analyses per month',
      'Basic AI detection',
      'Standard support',
      'API access'
    ],
    creditsPerInterval: 100
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 29.99,
    interval: 'month',
    features: [
      'Unlimited analyses',
      'Advanced AI detection',
      'Priority support',
      'API access',
      'Custom integration',
      'Team collaboration'
    ],
    creditsPerInterval: -1, // Unlimited
    isPopular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99.99,
    interval: 'month',
    features: [
      'Unlimited analyses',
      'Enterprise AI detection',
      'Dedicated support',
      'Custom API access',
      'Advanced integration',
      'Team management',
      'Custom reporting'
    ],
    creditsPerInterval: -1 // Unlimited
  }
];

export default function BillingManager() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>(user?.subscription?.plan || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubscribe = async (planId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          planId: selectedPlan,
          paymentMethodId: paymentMethod.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }

      const data = await response.json();
      if (data.requires_action) {
        // Handle 3D Secure authentication if needed
        const { error } = await stripe.handleCardAction(data.payment_intent_client_secret);
        if (error) {
          throw new Error(error.message);
        }
      }

      // Refresh subscription data
      await refetchSubscription();
      toast.success('Successfully subscribed to plan');
      setSelectedPlan(planId);
    } catch (error) {
      toast.error('Failed to subscribe to plan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Current Plan */}
      <div className="p-6 rounded-xl border border-accent-500/20 bg-accent-500/5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white/90">Current Plan</h3>
            <p className="text-white/70">You are currently on the Free plan</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white/90">
              {user?.credits} credits
            </p>
            <p className="text-sm text-white/60">remaining this month</p>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {BILLING_PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative p-6 rounded-xl border ${
              plan.isPopular
                ? 'border-accent-500'
                : 'border-white/10'
            } bg-white/5 space-y-6`}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 text-xs font-medium text-white bg-accent-500 rounded-full">
                  Most Popular
                </span>
              </div>
            )}

            <div>
              <h3 className="text-xl font-bold text-white/90">{plan.name}</h3>
              <div className="mt-2 flex items-baseline">
                <span className="text-4xl font-bold text-white/90">
                  ${plan.price}
                </span>
                <span className="ml-2 text-white/60">/{plan.interval}</span>
              </div>
            </div>

            <ul className="space-y-3">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <FiCheck className="w-5 h-5 text-green-500 shrink-0" />
                  <span className="text-white/70">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleSubscribe(plan.id)}
              disabled={isLoading || selectedPlan === plan.id}
              className={`${formStyles.button} w-full ${
                selectedPlan === plan.id
                  ? 'bg-accent-700 cursor-not-allowed'
                  : ''
              }`}
              style={{ background: 'var(--accent-500)' }}
            >
              {isLoading
                ? 'Processing...'
                : selectedPlan === plan.id
                ? 'Current Plan'
                : 'Subscribe'}
            </button>
          </div>
        ))}
      </div>

      {/* Payment Method */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white/90">Payment Method</h3>
        <div className="p-4 rounded-lg border border-white/10 bg-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-accent-500/20 flex items-center justify-center">
                <FiCreditCard className="w-5 h-5 text-accent-300" />
              </div>
              <div>
                <p className="font-medium text-white/90">•••• •••• •••• 4242</p>
                <p className="text-sm text-white/60">Expires 12/25</p>
              </div>
            </div>
            <button className="text-accent-300 hover:text-accent-200 transition-colors">
              Update
            </button>
          </div>
        </div>
      </div>

      {/* Billing History */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white/90">Billing History</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-white/10">
                <th className="pb-3 font-medium text-white/70">Date</th>
                <th className="pb-3 font-medium text-white/70">Description</th>
                <th className="pb-3 font-medium text-white/70">Amount</th>
                <th className="pb-3 font-medium text-white/70">Status</th>
              </tr>
            </thead>
            <tbody className="text-white/90">
              <tr>
                <td className="py-3">Oct 1, 2023</td>
                <td>Pro Plan Subscription</td>
                <td>$29.99</td>
                <td>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-500">
                    Paid
                  </span>
                </td>
              </tr>
              {/* Add more rows as needed */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}