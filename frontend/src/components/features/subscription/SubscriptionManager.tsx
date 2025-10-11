import React from 'react';
import { useSubscription } from '../../../hooks/useSubscription';
import { Plan, Subscription } from '../../../types';
import { Card } from '../../ui/Card';
import PlanSelector from './PlanSelector';
import PaymentForm from './PaymentForm';
import UsageStats from '../subscription/UsageStats';

export interface SubscriptionManagerProps {
  className?: string;
}

export const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ className }) => {
  const { subscription, isLoading, updateSubscription, cancelSubscription } = useSubscription();
  const [selectedPlan, setSelectedPlan] = React.useState<Plan | null>(null);
  const [showPayment, setShowPayment] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowPayment(true);
    setError(null);
  };

  const handlePaymentComplete = async (paymentMethod: string) => {
    if (!selectedPlan) return;

    try {
      await updateSubscription(selectedPlan.id);
      setShowPayment(false);
      setSelectedPlan(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update subscription');
    }
  };

  const handleCancelSubscription = async () => {
    try {
      await cancelSubscription();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <div className="p-4">Loading subscription details...</div>
      </Card>
    );
  }

  return (
    <div className={className}>
      {error && (
        <div className="mb-4 p-3 text-sm text-red-600 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      <Card className="mb-6">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900">Current Plan</h2>
          {subscription ? (
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {subscription.planType.toUpperCase()} Plan
                </p>
                <p className="text-sm text-gray-500">
                  Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              </div>
              
              <UsageStats />

              {subscription.status === 'active' && (
                <button
                  onClick={handleCancelSubscription}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          ) : (
            <p className="mt-2 text-gray-600">No active subscription</p>
          )}
        </div>
      </Card>

      {showPayment && selectedPlan ? (
        <Card>
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Payment Details
            </h3>
            <PaymentForm
              plan={selectedPlan}
              onComplete={handlePaymentComplete}
              onCancel={() => setShowPayment(false)}
            />
          </div>
        </Card>
      ) : (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Available Plans
          </h3>
          <PlanSelector
            currentPlan={subscription?.planType}
            onSelect={handlePlanSelect}
          />
        </div>
      )}
    </div>
  );
};

export default SubscriptionManager;