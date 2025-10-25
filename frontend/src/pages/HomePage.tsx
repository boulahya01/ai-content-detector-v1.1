import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { AccuracyIcon, SpeedIcon, ReportsIcon } from '@/components/ui/icons/FeatureIcons';
import { PageLayout } from '@/components/PageLayout';

type Feature = {
  name: string;
  description: string;
  icon: React.ReactNode | React.ComponentType<any>;
};

const features: Feature[] = [
  {
    name: 'High Accuracy',
    description: 'Industry-leading detection accuracy for reliable results.',
    icon: AccuracyIcon,
  },
  {
    name: 'Fast Results',
    description: 'Analyze text in seconds with optimized detection pipelines.',
    icon: SpeedIcon,
  },
  {
    name: 'Clear Reports',
    description: 'Readable results with confidence scores and quick recommendations.',
    icon: ReportsIcon,
  },
];

export default function HomePage(): JSX.Element {
  const { user } = useAuth();
  const navigate = useNavigate();
  // Free plan character limit for anonymous users
  const FREE_CHAR_LIMIT = 2000;

  const [value, setValue] = React.useState<string>('');
  const [text, setText] = React.useState<string>('');

  React.useEffect(() => {
    const id = setTimeout(() => setText(value), 250);
    return () => clearTimeout(id);
  }, [value]);

  const onAnalyze = React.useCallback(() => {
    if (!text.trim()) return;
    navigate('/analysis', { state: { text } });
  }, [navigate, text]);
  return (
    <PageLayout title="AI Content Detector" description="Quickly check whether text was produced by AI" wide center>
      <div className="mx-auto max-w-3xl">
  <section className="mb-8 mt-10">
          <label htmlFor="home-input" className="sr-only">Paste your text here</label>
          <textarea
            id="home-input"
            rows={6}
            value={value}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
              let val = e.target.value;
              if (!user && val.length > FREE_CHAR_LIMIT) {
                val = val.slice(0, FREE_CHAR_LIMIT);
              }
              setValue(val);
            }}
            className="w-full rounded-xl p-6 min-h-[12rem] leading-relaxed resize-vertical
              transition-all duration-200 focus:ring-2 focus:ring-accent-500/50 bg-card text-foreground placeholder-muted-foreground
              border border-border shadow-lg hover:shadow-xl hover:border-accent-500/20"
            placeholder="Paste your text here"
            aria-label="Text to analyze"
          />

          <div className="mt-5 flex flex-col sm:flex-row sm:justify-between items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="file" className="hidden" accept=".txt,.doc,.docx,.pdf" />
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-card border border-border text-foreground hover:bg-muted transition-colors duration-200 group-hover:border-accent-500/20">
                <svg className="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m0-16l-4 4m4-4l4 4"/>
                </svg>
                Upload file
              </span>
            </label>
            <button
              onClick={onAnalyze}
              disabled={!text.trim()}
              className="px-8 py-3 text-lg font-bold rounded-full bg-accent-500 text-white shadow-lg hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 focus:ring-2 focus:ring-accent-500/50 focus:outline-none"
            >
              <span className="flex items-center gap-2">
                Analyze
                <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                </svg>
              </span>
            </button>
          </div>
        </section>

  {/* CTA Section */}
  <section className="mt-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold mb-4">Ready to get started?</h2>
          <p className="text-white/70 mb-8">
            Join thousands of users who trust our AI detection technology.<br />
            Try it now for free or explore our pro features.
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => navigate('/register')}
              className="btn rounded-full px-8 py-3 text-lg font-bold shadow-md focus:ring-2 focus:ring-accent-300 hover:bg-accent-600 transition-colors"
              style={{ background: 'var(--accent-500)' }}
            >
              Get started
            </button>
          </div>
        </section>

        {/* Features */}
        <section className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.name}
              className="rounded-xl border border-border bg-card p-7 flex flex-col items-center text-center shadow-lg hover:shadow-xl hover:border-accent-500/20 transition-all duration-200"
              tabIndex={0}
              aria-label={f.name}
            >
              <div className="mb-4 flex items-center justify-center">
                {typeof f.icon === 'function' ? (
                  React.createElement(f.icon as React.ElementType, { className: 'w-12 h-12 md:w-16 md:h-16 text-[color:var(--accent-500)]' })
                ) : (
                  f.icon
                )}
              </div>
              <h3 className="text-lg font-bold font-heading text-white mb-2">{f.name}</h3>
              <p className="text-white/80 text-base leading-relaxed">{f.description}</p>
            </div>
          ))}
        </section>
      </div>
    </PageLayout>
  );
}