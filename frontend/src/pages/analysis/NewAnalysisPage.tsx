import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useAnalysis } from '@/context/AnalysisContext';
import RadialChart from '@/components/charts/RadialChart';
import IndicatorCard from '@/components/IndicatorCard';
import { toast } from 'sonner';
import { FiFileText, FiUpload, FiCopy, FiDownload } from 'react-icons/fi';
import { analysisService } from '@/api/analysis';

interface AnalysisResult {
  authenticityScore: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  aiProbability: number;
  indicators: Array<{
    type: string;
    description: string;
    confidence: number;
  }>;
}

export default function AnalyzePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { analyzeText: analyzeTextCtx } = useAnalysis();
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [language, setLanguage] = useState('auto');
  const [showDetails, setShowDetails] = useState(false);

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text to analyze');
      return;
    }

    if (text.length > 2000) {
      toast.error('Text must be 2000 characters or fewer.');
      return;
    }

        {result && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white/90">Results</h2>

            <div className="p-6 rounded-xl border border-white/10 bg-white/5">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-white/6 text-center">
                    <div className="text-sm text-white/60">AI Probability</div>
                    <div className="text-2xl font-bold text-white/90">{result.aiProbability}%</div>
                  </div>
                  <div className="p-4 rounded-lg bg-white/6 text-center">
                    <div className="text-sm text-white/60">Human Authenticity</div>
                    <div className="text-2xl font-bold text-white/90">{result.authenticityScore}%</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <button
                    className="px-3 py-2 rounded-md bg-white/5 text-white/80 hover:bg-white/10"
                    onClick={() => setShowDetails(s => !s)}
                    aria-expanded={showDetails}
                  >
                    {showDetails ? 'Hide details' : 'Show details'}
                  </button>
                </div>
              </div>

              {showDetails && (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-white/10 bg-white/5">
                    <div className="flex items-center gap-6">
                      <RadialChart value={result.authenticityScore} size={120} stroke={10} label="Authenticity" />
                      <div className="flex-1">
                        <div className="text-2xl font-bold text-white/90">{result.authenticityScore}%</div>
                        <div className="text-sm text-white/60">Authenticity Score</div>
                        <div className="mt-2 text-sm text-white/60">{result.aiProbability}% AI probability</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {result.indicators.map((indicator, index) => (
                      <IndicatorCard key={index} title={indicator.type} description={indicator.description} confidence={indicator.confidence} />
                    ))}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white/90 hover:bg-white/10 transition-colors">
                      <FiDownload className="w-4 h-4" />
                      <span>Download Report</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    toast.success('Text copied to clipboard');
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
      toast.success('Text pasted from clipboard');
    } catch (error) {
      toast.error('Failed to paste from clipboard');
    }
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white/90">New Analysis</h1>
          <p className="text-white/60">
            Analyze text to detect AI-generated content with high accuracy
          </p>
        </div>
        <div className="flex items-center space-x-4">
          {(!user?.role || user.role === 'free') && (
            <Link 
              to="/analysis/pro"
              className="px-4 py-2 rounded-lg bg-accent-500/20 text-accent-300 hover:bg-accent-500/30 transition-colors"
            >
              Try Pro Analysis
            </Link>
          )}
          <Link 
            to="/analysis/history"
            className="px-4 py-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 hover:text-white/90 transition-colors"
          >
            View History
          </Link>
        </div>
      </div>

      {/* Analysis Form */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8">
        {/* Left Column - Text Input */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white/90">Input Text</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg text-white/60 hover:text-white/90 hover:bg-white/5 transition-colors"
                title="Copy text"
              >
                <FiCopy className="w-5 h-5" />
              </button>
              <button
                onClick={handlePaste}
                className="p-2 rounded-lg text-white/60 hover:text-white/90 hover:bg-white/5 transition-colors"
                title="Paste text"
              >
                <FiUpload className="w-5 h-5" />
              </button>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter or paste your text here... (max 2000 chars)"
            maxLength={2000}
            className="w-full h-[400px] rounded-xl p-4 bg-white/5 border border-white/10 text-white/90 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
          />

          <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/90 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
              >
                <option value="auto">Auto Detect</option>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>

              <span className="text-sm text-white/60">
                {text.length} / 2000 characters
              </span>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isLoading || !text.trim() || text.length > 2000}
              className="px-6 py-2 rounded-lg bg-accent-500 hover:bg-accent-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Analyzing...</span>
                </div>
              ) : (
                'Analyze Text'
              )}
            </button>
          </div>
        </div>

        {/* Right Column - Results */}
        {result && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-white/90">Results</h2>

            {/* Score Card */}
            <div className="p-6 rounded-xl border border-white/10 bg-white/5">
              <div className="flex items-center gap-6">
                <RadialChart value={result.authenticityScore} size={120} stroke={10} label="Authenticity" />
                <div className="flex-1">
                  <div className="text-2xl font-bold text-white/90">{result.authenticityScore}%</div>
                  <div className="text-sm text-white/60">Authenticity Score</div>
                  <div className="mt-2 text-sm text-white/60">{result.aiProbability}% AI probability</div>
                  <div className="h-2 rounded-full bg-white/10 mt-4">
                    <div className="h-2 rounded-full bg-accent-500" style={{ width: `${result.authenticityScore}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Indicators */}
            <div className="space-y-4">
              <h3 className="font-medium text-white/90">Analysis Details</h3>
              {result.indicators.map((indicator, index) => (
                <IndicatorCard key={index} title={indicator.type} description={indicator.description} confidence={indicator.confidence} />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-white/90 hover:bg-white/10 transition-colors">
                <FiDownload className="w-4 h-4" />
                <span>Download Report</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}