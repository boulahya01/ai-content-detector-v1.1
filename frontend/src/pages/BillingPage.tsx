import BillingForm from '@/components/subscription/BillingForm';

export default function BillingPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Billing</h1>
      <BillingForm />
    </div>
  );
}
