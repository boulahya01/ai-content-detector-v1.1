import UsageStats from '@/components/subscription/UsageStats';
import BillingForm from '@/components/subscription/BillingForm';

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UsageStats />
        <BillingForm />
      </div>
    </div>
  );
}