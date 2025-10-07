import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { CheckmarkIcon, LightningIcon, ChartBarIcon } from '@/components/ui/icons';

type Feature = {
  name: string;
  description: string;
  icon: React.ReactNode;
};

const features: Feature[] = [
  {
    name: 'High Accuracy',
    description: 'Industry-leading detection accuracy for reliable results.',
    icon: <CheckmarkIcon className="w-6 h-6 text-indigo-600" />,
  },
  {
    name: 'Fast Results',
    description: 'Analyze text in seconds with optimized detection pipelines.',
    icon: <LightningIcon className="w-6 h-6 text-indigo-600" />,
  },
  {
    name: 'Clear Reports',
    description: 'Readable results with confidence scores and quick recommendations.',
    icon: <ChartBarIcon className="w-6 h-6 text-indigo-600" />,
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
    navigate('/analyze', { state: { text } });
  }, [navigate, text]);

  return (
    <div className="content-container section">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900">AI Content Detector</h1>
        <p className="mt-3 text-lg text-gray-600">Quickly check whether text was produced by AI.</p>

        <div className="mt-8 bg-white rounded-lg shadow-sm ring-1 ring-gray-100 p-6 mx-auto max-w-2xl sm:p-8">
          <label htmlFor="home-input" className="sr-only">Text to analyze</label>
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
            className="w-full rounded-lg border border-gray-200 p-4 min-h-[12rem] leading-relaxed resize-vertical transition-shadow focus:shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-100"
            placeholder="Paste text to analyze..."
          />

          <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm gap-2">
            <div className={value.length >= FREE_CHAR_LIMIT ? 'text-red-600' : 'text-gray-500'}>
              {value.length} / {FREE_CHAR_LIMIT} chars
            </div>
            {value.length >= FREE_CHAR_LIMIT && (
              <div className="text-red-600 text-sm">
                limit reached — <Link to="/login" className="underline font-medium">log in</Link> & <Link to="/pricing" className="underline font-medium">upgrade</Link> for longer text.
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-center">
            <Button size="lg" onClick={onAnalyze} disabled={!text.trim()} className="shadow w-full sm:w-auto px-8">
              {user ? 'Analyze' : 'Analyze (free)'}
            </Button>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.name} className="flex items-start gap-4 bg-white p-4 rounded-lg shadow">
              <div className="mt-1">{f.icon}</div>
              <div>
                <div className="font-semibold">{f.name}</div>
                <div className="text-sm text-gray-600">{f.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}