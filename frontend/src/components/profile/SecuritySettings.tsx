import { useState } from 'react';

export default function SecuritySettings() {
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <div className="space-y-4 text-sm">
      <div className="p-3 rounded-lg bg-[color:var(--card-surface)] border border-white/6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-white/90">Two-factor authentication</div>
            <div className="text-xs text-white/60">Add an extra layer of security to your account</div>
          </div>
          <div>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={twoFactor}
                onChange={() => setTwoFactor(v => !v)}
                className="rounded border-white/10 bg-black/40"
              />
              <span className="text-sm text-white/80">Enabled</span>
            </label>
          </div>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-[color:var(--card-surface)] border border-white/6">
        <div className="text-sm text-white/80">Active sessions and devices will appear here in a full implementation.</div>
      </div>
    </div>
  );
}
