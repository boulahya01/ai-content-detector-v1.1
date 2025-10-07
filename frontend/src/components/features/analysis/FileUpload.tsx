import React, { useState, useRef, useCallback } from 'react';
import { analysisService } from '@/api/analysis';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import type { AnalysisResult } from '@/types/api';
import { FilePreview } from './FilePreview';
import mammoth from 'mammoth';

interface FileUploadProps {
  onUploadComplete?: (data: AnalysisResult) => void;
}

interface FileStatus {
  file: File;
  content: string;
  uploadedAt: Date;
}

const ALLOWED_TYPES = ['text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [fileStatus, setFileStatus] = useState<FileStatus | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const readFileContent = async (file: File): Promise<string> => {
    if (file.type === 'text/plain') {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
      });
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    } else {
      throw new Error('Unsupported file type');
    }
  };

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Unsupported file type. Please use .txt or .docx files only.');
      toast.error('Unsupported file type. Use .txt or .docx');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum size allowed is 5MB.');
      toast.error('File too large. Max size is 5MB');
      return;
    }

    setProgress(0);
    setIsUploading(true);
    
    try {
      // First read the file content
      console.log('Reading file:', file.name, 'Type:', file.type, 'Size:', file.size);
      
      // Validate file size and type
      if (!file.size) {
        throw new Error('The file appears to be empty');
      }
      
      const content = await readFileContent(file);
      console.log('File content read successfully, length:', content.length);
      
      if (!content || content.length === 0) {
        throw new Error('The file appears to be empty');
      }
      
      // Set file status with content
      setFileStatus({
        file,
        content,
        uploadedAt: new Date()
      });
      
      toast.success('File uploaded successfully');
    } catch (error: any) {
      console.error('File upload error:', error);
      const errorMessage = error.message || 'Failed to upload file';
      setError(errorMessage);
      toast.error(errorMessage);
      setFileStatus(null);
    } finally {
      setProgress(null);
      setIsUploading(false);
    }
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!fileStatus) return;

    setIsAnalyzing(true);
    setProgress(0);
    setError(null);
    
    try {
      console.log('Starting file analysis...');
      const response = await analysisService.analyzeFile(
        fileStatus.file,
        undefined,
        (p) => setProgress(p)
      );
      
      if (!response || !response.data) {
        throw new Error('No response received from the server');
      }
      
      onUploadComplete?.(response.data);
      toast.success('Analysis completed successfully');
    } catch (error: any) {
      console.error('Analysis error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to analyze file';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setProgress(null);
      setIsAnalyzing(false);
    }
  }, [fileStatus, onUploadComplete]);

  const onSelectFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }, [handleFile]);

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`rounded-lg border p-4 transition-colors ${
          dragOver ? 'bg-gray-50 border-dashed border-indigo-500' : ''
        } ${error ? 'border-red-300' : ''}`}
      >
        <h3 className="text-lg font-semibold">File Upload</h3>
        <p className="text-sm text-gray-600 mb-3">Drop a .txt or .docx file here or select one to analyze (max 5MB).</p>

        <div className="flex gap-3 items-center">
          <input ref={inputRef} type="file" accept=".txt,.docx" onChange={onSelectFile} className="hidden" />
          <Button 
            onClick={() => inputRef.current?.click()} 
            variant="outline"
            disabled={isUploading || isAnalyzing}
          >
            {isUploading ? 'Uploading...' : 'Choose file'}
          </Button>
          <div className="text-sm text-gray-500">or drag & drop</div>
        </div>

        {error && (
          <div className="mt-2 text-sm text-red-500">
            {error}
          </div>
        )}

        {progress !== null && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{fileStatus?.file.name || 'File'}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-2 transition-all duration-300 ${
                  isAnalyzing ? 'bg-green-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${progress}%` }} 
              />
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {isAnalyzing ? 'Analyzing...' : 'Uploading...'}
            </div>
          </div>
        )}
      </div>



      {fileStatus && (
        <div className="border rounded-lg p-4 bg-white shadow-sm mt-4">
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm text-gray-600">
              <span className="font-medium">{fileStatus.file.name}</span>
              <span className="mx-2">•</span>
              <span>{Math.round(fileStatus.file.size / 1024)} KB</span>
            </div>
            <Button
              onClick={() => setFileStatus(null)}
              variant="outline"
              className="text-sm"
            >
              Remove
            </Button>
          </div>
          
          <FilePreview 
            content={fileStatus.content}
            fileName={fileStatus.file.name}
            fileType={fileStatus.file.type}
          />

          <div className="mt-4">
            <Button
              onClick={() => handleAnalyze()}
              disabled={isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Content'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
