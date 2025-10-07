import PlanCard from '@/components/subscription/PlanCard';

export default function PricingPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Pricing Plans</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <PlanCard title="Basic" price="$9.99/mo" features={["100 analyses/month"]} />
        <PlanCard title="Pro" price="$29.99/mo" features={["Unlimited analyses", "Priority support"]} />
        <PlanCard title="Enterprise" price="Contact" features={[]} />
      </div>
    </div>
  );
}