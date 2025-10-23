import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/hooks/useToast';
import { Loader2 } from 'lucide-react';
import { notificationService, type NotificationPreferences } from '@/services/notifications';

interface NotificationPreferences {
  email: {
    analysisResults: boolean;
    accountActivity: boolean;
    marketingUpdates: boolean;
    securityAlerts: boolean;
  };
  inApp: {
    analysisComplete: boolean;
    subscriptionUpdates: boolean;
    creditAlerts: boolean;
    newFeatures: boolean;
  };
}

export default function NotificationsSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: {
      analysisResults: true,
      accountActivity: true,
      marketingUpdates: false,
      securityAlerts: true,
    },
    inApp: {
      analysisComplete: true,
      subscriptionUpdates: true,
      creditAlerts: true,
      newFeatures: true,
    },
  });

  // Load initial preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const prefs = await notificationService.getPreferences();
        setPreferences(prefs);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load notification preferences.',
          variant: 'destructive',
        });
      }
    };

    loadPreferences();
  }, [toast]);

  const handleToggle = (category: 'email' | 'inApp', setting: string) => {
    setPreferences((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting as keyof typeof prev[typeof category]],
      },
    }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await notificationService.updatePreferences(preferences);
      toast({
        title: 'Settings Updated',
        description: 'Your notification preferences have been saved.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save notification preferences.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Email Notifications */}
      <div className="space-y-4">
        <div className="border-b border-white/10 pb-2">
          <h3 className="text-lg font-medium">Email Notifications</h3>
          <p className="text-sm text-muted-foreground">
            Choose what emails you'd like to receive
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label
                htmlFor="email-analysis"
                className="text-sm font-medium text-foreground"
              >
                Analysis Results
              </label>
              <p className="text-sm text-muted-foreground">
                Get notified when your content analysis is complete
              </p>
            </div>
            <Switch
              id="email-analysis"
              checked={preferences.email.analysisResults}
              onCheckedChange={() => handleToggle('email', 'analysisResults')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label
                htmlFor="email-activity"
                className="text-sm font-medium text-foreground"
              >
                Account Activity
              </label>
              <p className="text-sm text-muted-foreground">
                Receive updates about your account activity
              </p>
            </div>
            <Switch
              id="email-activity"
              checked={preferences.email.accountActivity}
              onCheckedChange={() => handleToggle('email', 'accountActivity')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label
                htmlFor="email-marketing"
                className="text-sm font-medium text-foreground"
              >
                Marketing Updates
              </label>
              <p className="text-sm text-muted-foreground">
                Receive tips, product updates and offers
              </p>
            </div>
            <Switch
              id="email-marketing"
              checked={preferences.email.marketingUpdates}
              onCheckedChange={() => handleToggle('email', 'marketingUpdates')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label
                htmlFor="email-security"
                className="text-sm font-medium text-foreground"
              >
                Security Alerts
              </label>
              <p className="text-sm text-muted-foreground">
                Get notified about security updates and unusual activity
              </p>
            </div>
            <Switch
              id="email-security"
              checked={preferences.email.securityAlerts}
              onCheckedChange={() => handleToggle('email', 'securityAlerts')}
            />
          </div>
        </div>
      </div>

      {/* In-App Notifications */}
      <div className="space-y-4">
        <div className="border-b border-white/10 pb-2">
          <h3 className="text-lg font-medium">In-App Notifications</h3>
          <p className="text-sm text-muted-foreground">
            Configure your in-app notification preferences
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label
                htmlFor="app-analysis"
                className="text-sm font-medium text-foreground"
              >
                Analysis Complete
              </label>
              <p className="text-sm text-muted-foreground">
                Show notification when analysis is finished
              </p>
            </div>
            <Switch
              id="app-analysis"
              checked={preferences.inApp.analysisComplete}
              onCheckedChange={() => handleToggle('inApp', 'analysisComplete')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label
                htmlFor="app-subscription"
                className="text-sm font-medium text-foreground"
              >
                Subscription Updates
              </label>
              <p className="text-sm text-muted-foreground">
                Get notified about subscription changes and renewals
              </p>
            </div>
            <Switch
              id="app-subscription"
              checked={preferences.inApp.subscriptionUpdates}
              onCheckedChange={() => handleToggle('inApp', 'subscriptionUpdates')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label
                htmlFor="app-credits"
                className="text-sm font-medium text-foreground"
              >
                Credit Alerts
              </label>
              <p className="text-sm text-muted-foreground">
                Receive alerts when credits are low or added
              </p>
            </div>
            <Switch
              id="app-credits"
              checked={preferences.inApp.creditAlerts}
              onCheckedChange={() => handleToggle('inApp', 'creditAlerts')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label
                htmlFor="app-features"
                className="text-sm font-medium text-foreground"
              >
                New Features
              </label>
              <p className="text-sm text-muted-foreground">
                Stay updated about new features and improvements
              </p>
            </div>
            <Switch
              id="app-features"
              checked={preferences.inApp.newFeatures}
              onCheckedChange={() => handleToggle('inApp', 'newFeatures')}
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </div>
  );
}
