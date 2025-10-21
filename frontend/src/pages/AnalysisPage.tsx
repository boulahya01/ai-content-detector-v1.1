import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAnalysis } from '@/context/AnalysisContext';
import { FiFileText, FiUpload, FiCopy, FiDownload } from 'react-icons/fi';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { analysisService } from '@/api/analysis';

interface AnalysisResult {
  id: string;
  authenticityScore: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  aiProbability: number;
  indicators: Array<{
    type: string;
    description: string;
    confidence: number;
  }>;
}

export default function AnalysisPage() {
  const { user } = useAuth();
  const { analyzeText: analyzeTextCtx, isAnalyzing, progress } = useAnalysis();
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [language, setLanguage] = useState('auto');
  const [analysisMode, setAnalysisMode] = useState<'single' | 'bulk'>('single');
  const [batchTexts, setBatchTexts] = useState<string[]>(['']);

  const isPro = user?.role === 'pro';

  const handleAnalyze = async () => {
    if (!text.trim() && analysisMode === 'single') {
      toast.error('Please enter some text to analyze');
      return;
    }

    if (analysisMode === 'bulk' && !batchTexts.some(t => t.trim())) {
      toast.error('Please enter at least one text to analyze');
      return;
    }

    // Allow interactive single-text analyses for all users as test analyses
    if (analysisMode === 'single' && text.length > 2000) {
      toast.error('Text must be 2000 characters or fewer for test analysis.');
      return;
    }

    setIsLoading(true);
    try {
      const respResult = await analyzeTextCtx(text, { language: language === 'auto' ? undefined : language, detailed: true });
      const data = respResult as any;

      // Normalize aiProbability
      let rawAiProb: number | undefined = data.aiProbability ?? data.analysisDetails?.aiProbability;
      let aiProbabilityPercent = 0;
      if (typeof rawAiProb === 'number') {
        aiProbabilityPercent = rawAiProb > 1 ? Math.round(rawAiProb) : Math.round(rawAiProb * 100);
      }

      // Normalize authenticityScore
      let rawAuth = data.authenticityScore ?? data.authenticityScor ?? undefined;
      let authenticityScorePercent = 0;
      if (typeof rawAuth === 'number') {
        authenticityScorePercent = rawAuth > 1 ? Math.round(rawAuth) : Math.round(rawAuth * 100);
      } else if (aiProbabilityPercent) {
        authenticityScorePercent = 100 - aiProbabilityPercent;
      }

      const indicators = data.analysisDetails?.indicators || data.indicators || [];
      const normalizedIndicators = indicators.map((indicator: any) => {
        const confRaw = indicator.confidence;
        let confFraction = 0;
        if (typeof confRaw === 'number') {
          confFraction = confRaw > 1 ? confRaw / 100 : confRaw;
        }
        return {
          type: indicator.type,
          description: indicator.description,
          confidence: confFraction,
        };
      });

      setResult({
        id: data.analysisId || data.id || '1',
        authenticityScore: authenticityScorePercent,
        confidenceLevel: data.confidence > 0.8 ? 'high' : data.confidence > 0.6 ? 'medium' : 'low',
        aiProbability: aiProbabilityPercent,
        indicators: normalizedIndicators,
      });
      toast.success('Analysis completed successfully');
    } catch (error: any) {
      const msg = error?.message || 'Failed to analyze text';
      toast.error(msg);
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

  const addBatchText = () => {
    if (!isPro) {
      toast.error('Bulk analysis is a pro feature');
      return;
    }
    setBatchTexts(prev => [...prev, '']);
  };

  const updateBatchText = (index: number, value: string) => {
    setBatchTexts(prev => prev.map((text, i) => i === index ? value : text));
  };

  const removeBatchText = (index: number) => {
    setBatchTexts(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white/90">Content Analysis</h1>
          <p className="text-sm text-white/60 mt-1">
            {isPro ? 'Pro Analysis with advanced features' : 'Basic content analysis'}
          </p>
        </div>
        {isPro && (
          <div className="flex items-center gap-4">
            <button
              onClick={() => setAnalysisMode('single')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                analysisMode === 'single'
                  ? 'bg-accent-500 text-white'
                  : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              Single Text
            </button>
            <button
              onClick={() => setAnalysisMode('bulk')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                analysisMode === 'bulk'
                  ? 'bg-accent-500 text-white'
                  : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              Bulk Analysis
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8">
        {/* Left Column - Input */}
        <div className="space-y-4">
          {analysisMode === 'single' ? (
            <>
              {/* Single Text Analysis */}
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-medium text-white/90">Input Text</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="p-2 rounded-lg text-white/60 hover:text-white/90 hover:bg-white/5 transition-colors"
                    >
                      <FiCopy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handlePaste}
                      className="p-2 rounded-lg text-white/60 hover:text-white/90 hover:bg-white/5 transition-colors"
                    >
                      <FiUpload className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Enter or paste your text here..."
                  className="w-full h-[300px] bg-transparent border-0 text-white/90 placeholder:text-white/40 resize-none focus:ring-0"
                />
              </div>
            </>
          ) : (
            <>
              {/* Bulk Analysis */}
              <div className="space-y-4">
                {batchTexts.map((text, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-sm font-medium text-white/90">Text #{index + 1}</h2>
                      {index > 0 && (
                        <button
                          onClick={() => removeBatchText(index)}
                          className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <textarea
                      value={text}
                      onChange={(e) => updateBatchText(index, e.target.value)}
                      placeholder={`Enter text #${index + 1}...`}
                      className="w-full h-[150px] bg-transparent border-0 text-white/90 placeholder:text-white/40 resize-none focus:ring-0"
                    />
                  </div>
                ))}
                <button
                  onClick={addBatchText}
                  className="w-full py-3 rounded-lg border border-dashed border-white/20 text-white/60 hover:text-white/90 hover:border-white/30 transition-colors"
                >
                  Add Another Text
                </button>
              </div>
            </>
          )}

          {/* Analysis Controls */}
          <div className="flex items-center justify-between">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white/5 text-white/90 rounded-lg px-3 py-2 border border-white/10 text-sm"
            >
              <option value="auto">Auto Detect</option>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>

            <button
              onClick={handleAnalyze}
                disabled={isLoading || (analysisMode === 'single' ? !text.trim() || text.length > 2000 : !batchTexts.some(t => t.trim()))}
              className="px-6 py-2 rounded-lg bg-accent-500 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent-600 transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Analyzing...</span>
                </div>
              ) : (
                'Analyze'
              )}
            </button>
          </div>
        </div>

        {/* Right Column - Results */}
        {result && (
          <div className="space-y-6">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h2 className="text-lg font-medium text-white/90 mb-4">Analysis Results</h2>
              
              <div className="space-y-6">
                {/* Score */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-2xl font-bold ${
                      result.authenticityScore >= 80 ? 'text-[#10b981]' : 'text-[#ef4444]'
                    }`}>
                      {result.authenticityScore}%
                    </div>
                    <div className="text-sm text-white/60">
                      Authenticity Score
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-white/90">
                      {result.aiProbability}%
                    </div>
                    <div className="text-sm text-white/60">
                      AI Probability
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-2 rounded-full bg-white/10">
                  <div
                    className={`h-2 rounded-full ${
                      result.authenticityScore >= 80 ? 'bg-[#10b981]' : 'bg-[#ef4444]'
                    }`}
                    style={{ width: `${result.authenticityScore}%` }}
                  />
                </div>

                {/* Indicators */}
                <div className="space-y-3">
                  {result.indicators.map((indicator, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white/90">
                          {indicator.type}
                        </span>
                        <span className="text-sm text-white/60">
                          {(indicator.confidence * 100).toFixed(0)}% confidence
                        </span>
                      </div>
                      <p className="text-sm text-white/70">
                        {indicator.description}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Export Button */}
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-white/90 hover:bg-white/10 transition-colors">
                  <FiDownload className="w-4 h-4" />
                  <span>Download Report</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}