import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/PageHeader';
import { CodeBlock } from '@/components/CodeBlock';

const integrationExamples = [
  {
    title: 'Node.js Integration',
    description: 'Example of integrating with Node.js and Express',
    code: `const express = require('express');
const axios = require('axios');

const app = express();
const API_KEY = process.env.AI_DETECTOR_API_KEY;

app.post('/analyze', async (req, res) => {
  try {
    const response = await axios.post(
      'https://api.aicontentdetector.com/v1/analyze',
      { text: req.body.text },
      {
        headers: {
          'Authorization': \`Bearer \${API_KEY}\`,
          'Content-Type': 'application/json'
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});`,
    language: 'javascript'
  },
  {
    title: 'Python Integration',
    description: 'Example of integrating with Python and FastAPI',
    code: `from fastapi import FastAPI, HTTPException
import httpx

app = FastAPI()
API_KEY = os.getenv("AI_DETECTOR_API_KEY")

@app.post("/analyze")
async def analyze_text(text: str):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.aicontentdetector.com/v1/analyze",
                json={"text": text},
                headers={
                    "Authorization": f"Bearer {API_KEY}",
                    "Content-Type": "application/json"
                }
            )
            return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))`,
    language: 'python'
  },
  {
    title: 'React Integration',
    description: 'Example of integrating with React frontend',
    code: `import { useState } from 'react';
import axios from 'axios';

function ContentAnalyzer() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeContent = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        'https://api.aicontentdetector.com/v1/analyze',
        { text },
        {
          headers: {
            'Authorization': \`Bearer \${process.env.REACT_APP_API_KEY}\`
          }
        }
      );
      setResult(response.data);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to analyze"
      />
      <button 
        onClick={analyzeContent}
        disabled={loading}
      >
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>
      {result && (
        <div>
          <p>AI Score: {result.score}</p>
          <p>Classification: {result.classification}</p>
        </div>
      )}
    </div>
  );
}`,
    language: 'jsx'
  }
];

export default function IntegrationExamplesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Integration Examples"
        description="Code examples for integrating our AI Content Detection service"
      />

      <div className="space-y-8 mt-8">
        {integrationExamples.map((example) => (
          <Card key={example.title} className="p-6">
            <h2 className="text-xl font-semibold mb-2">{example.title}</h2>
            <p className="text-muted-foreground mb-4">{example.description}</p>
            <CodeBlock
              code={example.code}
              language={example.language}
            />
          </Card>
        ))}
      </div>

      <Card className="mt-8 p-6">
        <h2 className="text-xl font-semibold mb-4">Have Questions?</h2>
        <p className="text-muted-foreground">
          Need help with integration or have specific use cases?
          Our support team is ready to assist you.
        </p>
      </Card>
    </div>
  );
}