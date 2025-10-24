// React import not required with the new JSX transform

export default function AppearanceSettings() {
  return (
    <div className="space-y-4 text-sm">
      <div className="p-3 rounded-lg bg-[color:var(--card-surface)] border border-white/6">
        <div className="text-sm font-medium text-white/90 mb-1">Theme</div>
        <div className="flex items-center gap-2">
          <button className="px-2 py-1 rounded bg-white/5 text-white/90 text-sm">Dark</button>
          <button className="px-2 py-1 rounded bg-white/3 text-white/70 text-sm">Light</button>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-[color:var(--card-surface)] border border-white/6">
        <div className="text-sm text-white/80">More appearance options will be added here.</div>
      </div>
    </div>
  );
}
