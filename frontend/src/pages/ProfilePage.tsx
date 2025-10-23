import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { useCredits } from '@/context/CreditsContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/hooks/useToast';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { user, isLoading: authLoading, updateUser } = useAuth();
  const { subscription } = useSubscription();
  const { balance: credits } = useCredits();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    company: user?.company || '',
    website: user?.website || ''
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      await updateUser(formData);
      toast({
        title: 'Profile Updated',
        description: 'Your profile information has been updated successfully.'
      });
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container py-8">
      <Tabs defaultValue="profile" className="space-y-8">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={user.email}
                    disabled
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Company</label>
                  <Input
                    type="text"
                    value={formData.company}
                    onChange={(e) =>
                      setFormData({ ...formData, company: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Website</label>
                  <Input
                    type="url"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Member Since</label>
                  <p className="mt-1 text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Profile'
                )}
              </Button>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <Card>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Current Plan</h3>
                <p className="text-muted-foreground">
                  You are currently on the{' '}
                  <span className="font-medium text-primary">
                    {subscription?.tier || 'Free'}
                  </span>{' '}
                  plan.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-medium">Credits Balance</h3>
                <p className="text-muted-foreground">
                  You have{' '}
                  <span className="font-medium text-primary">{credits}</span>{' '}
                  credits remaining.
                </p>
              </div>

              <div className="flex space-x-4">
                <Button variant="outline" onClick={() => window.location.href = '/pricing'}>
                  Upgrade Plan
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/billing'}>
                  Billing Settings
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
              {/* Activity list will be implemented separately */}
              <p className="text-muted-foreground">
                Your recent activity will appear here.
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}