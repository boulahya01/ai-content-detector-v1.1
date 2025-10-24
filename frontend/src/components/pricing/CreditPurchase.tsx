import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  popular?: boolean;
}

const creditPackages: CreditPackage[] = [
  {
    id: 'small',
    name: 'Starter Pack',
    credits: 20,
    price: 4.99
  },
  {
    id: 'medium',
    name: 'Popular Pack',
    credits: 100,
    price: 19.99,
    popular: true
  },
  {
    id: 'large',
    name: 'Power Pack',
    credits: 500,
    price: 79.99
  }
];

export const CreditPurchase: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState<string | null>(null);

  const handlePurchase = async (pack: CreditPackage) => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to purchase credits.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(pack.id);
      // Implement credit purchase logic here
      
      toast({
        title: 'Purchase Successful',
        description: `Added ${pack.credits} credits to your account.`
      });
    } catch (error) {
      toast({
        title: 'Purchase Failed',
        description: 'Unable to process your purchase. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="w-full px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-8 text-center text-2xl font-bold">Purchase Credits</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {creditPackages.map((pack) => (
            <div
              key={pack.id}
              className={`relative rounded-lg border p-6 shadow-sm ${
                pack.popular ? 'border-primary ring-2 ring-primary' : 'border-border'
              }`}
            >
              {pack.popular && (
                <div className="absolute -top-3 left-0 right-0">
                  <div className="mx-auto w-fit rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    Best Value
                  </div>
                </div>
              )}

              <h3 className="mb-2 text-lg font-semibold">{pack.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">${pack.price}</span>
              </div>
              <p className="mb-6 text-sm text-muted-foreground">
                {pack.credits} credits
              </p>

              <Button
                className="w-full"
                variant={pack.popular ? 'default' : 'outline'}
                onClick={() => handlePurchase(pack)}
                disabled={loading === pack.id || !user}
              >
                {loading === pack.id ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Purchase Credits'
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};