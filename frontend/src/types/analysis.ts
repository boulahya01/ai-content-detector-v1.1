export interface AnalysisResult {
  id: string;
  userId: string;
  content: string;
  result: {
    text: string;
    scores: {
      [key: string]: number;
    };
    language: string;
    details: any;
  };
  createdAt: string;
  status: string;
  error?: string;
}