import { useState } from 'react';import { useState } from 'react';

import { useNavigate } from 'react-router-dom';import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/context/AuthContext';import { useAuth } from '@/context/AuthContext';

import { useAnalysis } from '@/context/AnalysisContext';import { useAnalysis } from '@/context/AnalysisContext';

import { toast } from 'sonner';import { toast } from 'sonner';

import TextAnalyzer from '@/components/analysis/TextAnalyzer';import TextAnalyzer from '@/components/analysis/TextAnalyzer';

import AnalysisResult from '@/components/analysis/AnalysisResult';import AnalysisResult from '@/components/analysis/AnalysisResult';

import AnalysisHistory from '@/components/analysis/AnalysisHistory';import AnalysisHistory from '@/components/analysis/AnalysisHistory';

import { analysisService } from '@/api/analysis';import { analysisService } from '@/api/analysis';



interface AnalysisResult {interface AnalysisResult {

  authenticityScore: number;  authenticityScore: number;

  confidenceLevel: 'high' | 'medium' | 'low';  confidenceLevel: 'high' | 'medium' | 'low';

  aiProbability: number;  aiProbability: number;

  indicators: Array<{  indicators: Array<{

    type: string;    type: string;

    description: string;    description: string;

    confidence: number;    confidence: number;

  }>;  }>;

  id?: string;}

}

interface AnalysisResult {

export default function AnalyzePage() {  authenticityScore: number;

  const { user } = useAuth();  confidenceLevel: 'high' | 'medium' | 'low';

  const navigate = useNavigate();  aiProbability: number;

  const { analyzeText } = useAnalysis();  indicators: Array<{

  const [isLoading, setIsLoading] = useState(false);    type: string;

  const [result, setResult] = useState<AnalysisResult | null>(null);    description: string;

  const [language, setLanguage] = useState('auto');    confidence: number;

  }>;

  const handleAnalyze = async (text: string, file?: File) => {  id?: string;

    setIsLoading(true);}

    try {

      let respResult;export default function AnalyzePage() {

        const { user } = useAuth();

      if (file) {  const navigate = useNavigate();

        const response = await analysisService.analyzeFile(file, {  const { analyzeText } = useAnalysis();

          language: language === 'auto' ? undefined : language,  const [isLoading, setIsLoading] = useState(false);

          detailed: true  const [result, setResult] = useState<AnalysisResult | null>(null);

        }, (progress) => {  const [language, setLanguage] = useState('auto');

          // Handle upload progress if needed

          console.log('Upload progress:', progress);  const handleAnalyze = async () => {

        });    if (!text.trim()) {

        respResult = response.data;      toast.error('Please enter some text to analyze');

      } else {      return;

        respResult = await analyzeText(text, {     }

          language: language === 'auto' ? undefined : language,

          detailed: true     if (text.length > 2000) {

        });      toast.error('Text must be 2000 characters or fewer.');

      }      return;

    }

      // Process response data    setIsLoading(true);

      const data = respResult as any;    try {

            const respResult = await analyzeTextCtx(text, { language: language === 'auto' ? undefined : language, detailed: true });

      // Normalize aiProbability      const data = respResult as any;

      let rawAiProb: number | undefined = data.aiProbability ?? data.analysisDetails?.aiProbability;

      let aiProbabilityPercent = 0;      // Normalize aiProbability

      if (typeof rawAiProb === 'number') {      let rawAiProb: number | undefined = data.aiProbability ?? data.analysisDetails?.aiProbability;

        aiProbabilityPercent = rawAiProb > 1 ? Math.round(rawAiProb) : Math.round(rawAiProb * 100);      let aiProbabilityPercent = 0;

      }      if (typeof rawAiProb === 'number') {

        aiProbabilityPercent = rawAiProb > 1 ? Math.round(rawAiProb) : Math.round(rawAiProb * 100);

      // Normalize authenticityScore      }

      let rawAuth = data.authenticityScore ?? data.authenticityScor ?? undefined;

      let authenticityScorePercent = 0;      // Normalize authenticityScore

      if (typeof rawAuth === 'number') {      let rawAuth = data.authenticityScore ?? data.authenticityScor ?? undefined;

        authenticityScorePercent = rawAuth > 1 ? Math.round(rawAuth) : Math.round(rawAuth * 100);      let authenticityScorePercent = 0;

      } else if (aiProbabilityPercent) {      if (typeof rawAuth === 'number') {

        authenticityScorePercent = 100 - aiProbabilityPercent;        authenticityScorePercent = rawAuth > 1 ? Math.round(rawAuth) : Math.round(rawAuth * 100);

      }      } else if (aiProbabilityPercent) {

        authenticityScorePercent = 100 - aiProbabilityPercent;

      // Process indicators      }

      const indicators = data.analysisDetails?.indicators || data.indicators || [];

      const normalizedIndicators = indicators.map((indicator: any) => {      const indicators = data.analysisDetails?.indicators || data.indicators || [];

        const confRaw = indicator.confidence;      const normalizedIndicators = indicators.map((indicator: any) => {

        let confFraction = 0;        const confRaw = indicator.confidence;

        if (typeof confRaw === 'number') {        let confFraction = 0;

          confFraction = confRaw > 1 ? confRaw / 100 : confRaw;        if (typeof confRaw === 'number') {

        }          confFraction = confRaw > 1 ? confRaw / 100 : confRaw;

        return {        }

          type: indicator.type,        return {

          description: indicator.description,          type: indicator.type,

          confidence: confFraction,          description: indicator.description,

        };          confidence: confFraction,

      });        };

      });

      setResult({

        authenticityScore: authenticityScorePercent,      setResult({

        confidenceLevel: data.confidence > 0.8 ? 'high' : data.confidence > 0.6 ? 'medium' : 'low',        authenticityScore: authenticityScorePercent,

        aiProbability: aiProbabilityPercent,        confidenceLevel: data.confidence > 0.8 ? 'high' : data.confidence > 0.6 ? 'medium' : 'low',

        indicators: normalizedIndicators,        aiProbability: aiProbabilityPercent,

        id: data.id        indicators: normalizedIndicators,

      });      });

      toast.success('Analysis completed successfully');      toast.success('Analysis completed successfully');

    } catch (error: any) {    } catch (error: any) {

      const msg = error?.message || 'Failed to analyze content';      const msg = error?.message || 'Failed to analyze text';

      toast.error(msg);      toast.error(msg);

          } finally {

      if (msg.includes('Insufficient balance')) {      setIsLoading(false);

        // Redirect to pricing page if out of credits    }

        navigate('/pricing');  };

      }

    } finally {  const handleCopy = () => {

      setIsLoading(false);    navigator.clipboard.writeText(text);

    }    toast.success('Text copied to clipboard');

  };  };



  const handleDownload = async () => {  const handlePaste = async () => {

    if (!result?.id) return;    try {

          const clipboardText = await navigator.clipboard.readText();

    try {      setText(clipboardText);

      const response = await analysisService.getAnalysisById(result.id);      toast.success('Text pasted from clipboard');

      const response = await fetch('/api/analysis/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          analysisId,
          format: 'pdf', // or 'docx'
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analysis-report-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Report downloaded successfully');
      } else {
        throw new Error('Failed to generate report');
      }
    } catch (error) {

      console.log('Download analysis:', response);      toast.error('Failed to paste from clipboard');

      toast.success('Report downloaded successfully');    }

    } catch (error) {  };

      toast.error('Failed to download report');

    }  return (

  };    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">

      {/* Header */}

  const handleShare = () => {      <div>

    if (!result?.id) return;        <h1 className="text-4xl font-bold text-white">Content Analysis</h1>

    const url = `${window.location.origin}/analysis/${result.id}`;        <p className="text-lg text-white/60 mt-2">

    navigator.clipboard.writeText(url);          Basic content analysis

    toast.success('Analysis link copied to clipboard');        </p>

  };      </div>



  return (      {/* Analysis Form */}

    <div className="container mx-auto max-w-7xl px-4 py-8">      <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-8 mt-8">

      <div className="flex flex-col lg:flex-row gap-8">        {/* Left Column - Text Input */}

        {/* Left Column - Analysis Input */}        <div className="space-y-4">

        <div className="flex-1">          <div className="flex items-center justify-between mb-2">

          <div className="space-y-6">            <h2 className="text-sm font-medium text-white/90">Input Text</h2>

            <div>            <div className="flex items-center gap-2">

              <h1 className="text-4xl font-bold text-white">Content Analysis</h1>              <button

              <p className="text-lg text-white/60 mt-2">                onClick={handleCopy}

                Check your content for AI-generated text                className="flex items-center gap-1 text-sm text-white/60 hover:text-white/90"

              </p>              >

            </div>                <FiCopy className="w-4 h-4" />

                Copy

            {/* Language Selection */}              </button>

            <div className="flex items-center gap-4">              <button

              <select                onClick={handlePaste}

                value={language}                className="flex items-center gap-1 text-sm text-white/60 hover:text-white/90"

                onChange={(e) => setLanguage(e.target.value)}              >

                className="px-3 py-2 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10 text-white/70 text-sm focus:outline-none focus:border-purple-500/50"                <FiUpload className="w-4 h-4" />

              >                Paste

                <option value="auto">Auto Detect Language</option>              </button>

                <option value="en">English</option>            </div>

                <option value="es">Spanish</option>          </div>

                <option value="fr">French</option>

                <option value="de">German</option>          <textarea

                {/* Add more languages as needed */}            value={text}

              </select>            onChange={(e) => setText(e.target.value)}

            </div>            placeholder="Enter or paste your text here..."

            maxLength={2000}

            {/* Text Analysis Input */}            className="w-full h-[400px] rounded-lg p-4 bg-black/40 backdrop-blur-sm border border-white/10 text-white/90 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50"

            <TextAnalyzer          />

              onAnalyze={handleAnalyze}

              isLoading={isLoading}          <div className="flex items-center justify-between mt-4">

              maxLength={2000}              <div className="flex items-center gap-4">

            />              <select

          </div>                value={language}

        </div>                onChange={(e) => setLanguage(e.target.value)}

                className="px-3 py-2 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10 text-white/70 text-sm focus:outline-none focus:border-purple-500/50"

        {/* Right Column - Results and History */}              >

        <div className="lg:w-[400px] space-y-8">                <option value="auto">Auto Detect</option>

          {result ? (                <option value="en">English</option>

            <AnalysisResult                <option value="es">Spanish</option>

              result={result}                <option value="fr">French</option>

              onDownload={handleDownload}              </select>

              onShare={handleShare}            </div>

              onRetry={() => setResult(null)}

            />            <button

          ) : (              onClick={handleAnalyze}

            <AnalysisHistory              disabled={isLoading || !text.trim() || text.length > 2000}

              onSelect={(id) => navigate(`/analysis/${id}`)}              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium text-white rounded-full shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"

            />              style={{ backgroundColor: 'var(--accent-500)', boxShadow: '0 18px 40px rgba(94,23,235,0.12)' }}

          )}            >

        </div>              {isLoading ? (

      </div>                <>

    </div>                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />

  );                  <span>Analyzing...</span>

}                </>
              ) : (
                <>
                  <span>Analyze Text</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column - Results */}
        {result && (
          <div className="space-y-6">
            <ResultCard
              result={{
                id: undefined,
                authenticityScore: result.authenticityScore,
                aiProbability: result.aiProbability,
                indicators: result.indicators,
              }}
              onDownload={(id) => console.log('download', id)}
              onCompare={(id) => console.log('compare', id)}
            />
          </div>
        )}
      </div>
    </div>
  );
}