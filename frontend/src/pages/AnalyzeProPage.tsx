import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { useAnalyzer } from '@/hooks/useAnalyzer';

interface AnalysisResult {
  score: number;
  confidence: number;
  details: {
    category: string;
    score: number;
    explanation: string;
  }[];
}

export default function AnalyzeProPage() {
  const { analyzeText } = useAnalyzer();
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [batchTexts, setBatchTexts] = useState<string[]>(['']);

  const handleSingleAnalysis = async () => {
    if (!text.trim()) {
      setError('Please enter some text to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      const result = await analyzeText(text);
      setResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBatchAnalysis = async () => {
    const validTexts = batchTexts.filter(t => t.trim());
    if (validTexts.length === 0) {
      setError('Please enter at least one text to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError('');

    try {
      // TODO: Implement batch analysis
      // const results = await analyzeBatch(validTexts);
      // Handle results...
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during batch analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const addBatchText = () => {
    setBatchTexts(prev => [...prev, '']);
  };

  const removeBatchText = (index: number) => {
    setBatchTexts(prev => prev.filter((_, i) => i !== index));
  };

  const updateBatchText = (index: number, value: string) => {
    setBatchTexts(prev => prev.map((text, i) => i === index ? value : text));
  };

  const renderAnalysisResult = (result: AnalysisResult) => {
    const scorePercentage = result.score * 100;
    const confidencePercentage = result.confidence * 100;

    const getScoreColor = (score: number) => {
      if (score >= 0.8) return 'text-red-600';
      if (score >= 0.4) return 'text-yellow-600';
      return 'text-green-600';
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">AI Content Score</h3>
            <div className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
              {scorePercentage.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Likelihood of AI-generated content
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Analysis Confidence</h3>
            <div className="text-4xl font-bold text-primary-600">
              {confidencePercentage.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Confidence level in the analysis
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Detailed Analysis</h3>
          <div className="space-y-4">
            {result.details.map((detail, index) => (
              <div key={index} className="border-b border-gray-200 pb-4 last:border-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{detail.category}</span>
                  <span className={`${getScoreColor(detail.score)}`}>
                    {(detail.score * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="text-sm text-gray-600">{detail.explanation}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pro Analysis</h1>
        <p className="mt-2 text-gray-600">
          Advanced AI content detection with detailed analysis and batch processing capabilities
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Single Analysis */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Single Text Analysis</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="text" className="block text-sm font-medium text-gray-700 mb-2">
                Enter text to analyze
              </label>
              <Textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={8}
                placeholder="Paste your text here..."
                className="mb-4"
              />
            </div>

            <Button
              onClick={handleSingleAnalysis}
              isLoading={isAnalyzing}
              className="w-full"
            >
              Analyze Text
            </Button>
          </div>
        </Card>

        {/* Batch Analysis */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Batch Analysis</h2>
          <div className="space-y-4">
            {batchTexts.map((text, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    Text #{index + 1}
                  </label>
                  {index > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeBatchText(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <Textarea
                  value={text}
                  onChange={(e) => updateBatchText(index, e.target.value)}
                  rows={4}
                  placeholder={`Enter text #${index + 1}...`}
                />
              </div>
            ))}

            <Button
              variant="outline"
              onClick={addBatchText}
              className="w-full"
            >
              Add Another Text
            </Button>

            <Button
              onClick={handleBatchAnalysis}
              isLoading={isAnalyzing}
              className="w-full"
            >
              Analyze Batch
            </Button>
          </div>
        </Card>
      </div>

      {error && (
        <div className="text-red-600 text-sm">
          {error}
        </div>
      )}

      {result && renderAnalysisResult(result)}

      {/* Pro Features */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Pro Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-medium text-lg mb-2">Detailed Analysis</h3>
            <p className="text-gray-600">
              Get comprehensive insights into AI detection patterns and confidence scores
            </p>
          </div>
          <div>
            <h3 className="font-medium text-lg mb-2">Batch Processing</h3>
            <p className="text-gray-600">
              Analyze multiple texts simultaneously for efficient content verification
            </p>
          </div>
          <div>
            <h3 className="font-medium text-lg mb-2">Advanced Metrics</h3>
            <p className="text-gray-600">
              Access detailed metrics and explanations for each analysis category
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}