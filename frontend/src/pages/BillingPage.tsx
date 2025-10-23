import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { useCredits } from '@/context/CreditsContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { useToast } from '@/hooks/useToast';
import { Loader2 } from 'lucide-react';

interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
}

export default function BillingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscription, createPortalSession } = useSubscription();
  const { transactions } = useCredits();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleManageSubscription = async () => {
    try {
      setIsLoading(true);
      const { url } = await createPortalSession({
        returnUrl: window.location.origin + '/billing'
      });
      window.location.href = url;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to open billing portal. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Billing & Subscription</h1>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="payment">Payment Method</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Current Plan</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Subscription Tier</p>
                    <p className="font-medium">{subscription?.tier || 'Free'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Billing Period</p>
                    <p className="font-medium">
                      {subscription?.current_period_end
                        ? `Until ${formatDate(subscription.current_period_end)}`
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">{subscription?.status || 'active'}</p>
                  </div>
                  
                  <div className="flex space-x-4 pt-4">
                    <Button onClick={() => navigate('/pricing')}>
                      Change Plan
                    </Button>
                    <Button variant="outline" onClick={handleManageSubscription} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        'Manage Subscription'
                      )}
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4">Payment Method</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Primary Payment Method</p>
                    <p className="font-medium">•••• •••• •••• 1234</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expiration</p>
                    <p className="font-medium">12/25</p>
                  </div>
                  <Button variant="outline" onClick={handleManageSubscription}>
                    Update Payment Method
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="invoices">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Billing History</h3>
              <div className="space-y-6">
                {transactions?.length > 0 ? (
                  <div className="divide-y">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="py-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium">{tx.type}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(tx.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {tx.amount} credits
                          </p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {tx.meta?.status || 'completed'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No billing history available.</p>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="payment">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Payment Settings</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Saved Payment Methods</h4>
                  <div className="bg-secondary/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                            />
                          </svg>
                        </div>
                        <div>
                          <p className="font-medium">Visa ending in 1234</p>
                          <p className="text-sm text-muted-foreground">Expires 12/25</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>

                <Button onClick={handleManageSubscription}>
                  Add Payment Method
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
