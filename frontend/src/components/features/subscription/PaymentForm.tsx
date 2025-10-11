import React from 'react';
import { Plan } from '../../../types';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';

export interface PaymentFormProps {
  plan: Plan;
  onComplete: (paymentMethod: string) => Promise<void>;
  onCancel: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  plan,
  onComplete,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Implement actual payment processing
      const paymentMethod = 'pm_card_visa'; // Placeholder
      await onComplete(paymentMethod);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">
          {error}
        </div>
      )}

      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-lg font-medium text-gray-900">Plan Details</h4>
        <p className="mt-1 text-sm text-gray-600">
          {plan.name} - ${plan.monthlyPrice}/month
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="cardName" className="block text-sm font-medium text-gray-700">
            Name on card
          </label>
          <Input
            id="cardName"
            name="cardName"
            type="text"
            required
            className="mt-1"
          />
        </div>

        <div>
          <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
            Card number
          </label>
          <Input
            id="cardNumber"
            name="cardNumber"
            type="text"
            required
            pattern="[0-9]{16}"
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="expiry" className="block text-sm font-medium text-gray-700">
              Expiry date
            </label>
            <Input
              id="expiry"
              name="expiry"
              type="text"
              placeholder="MM/YY"
              required
              pattern="[0-9]{2}/[0-9]{2}"
              className="mt-1"
            />
          </div>

          <div>
            <label htmlFor="cvc" className="block text-sm font-medium text-gray-700">
              CVC
            </label>
            <Input
              id="cvc"
              name="cvc"
              type="text"
              required
              pattern="[0-9]{3,4}"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end space-x-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : `Pay $${plan.monthlyPrice}`}
        </Button>
      </div>
    </form>
  );
};

export default PaymentForm;