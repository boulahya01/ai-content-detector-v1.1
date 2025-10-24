// React import not required with the new JSX transform

export default function BillingSettings() {
  return (
    <div className="space-y-4 text-sm">
      <div>
        <h3 className="text-base font-semibold text-white/90">Billing & Plans</h3>
        <p className="text-xs text-white/70">Manage your subscription, invoices, and payment methods.</p>
      </div>

      <div className="p-3 rounded-lg bg-[color:var(--card-surface)] border border-white/6">
        <div className="text-sm text-white/80">Billing and plan management will be added in a later iteration.</div>
      </div>
    </div>
  );
}
