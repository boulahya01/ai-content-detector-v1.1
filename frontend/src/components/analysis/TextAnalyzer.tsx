import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiCopy, FiFile, FiX } from 'react-icons/fi';
import { toast } from 'sonner';

interface TextAnalyzerProps {
  onAnalyze: (text: string, file?: File) => Promise<void>;
  isLoading: boolean;
  maxLength?: number;
}

export default function TextAnalyzer({ onAnalyze, isLoading, maxLength = 2000 }: TextAnalyzerProps) {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB');
        return;
      }
      setFile(file);
      setText(''); // Clear text input when file is selected
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  });

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

  const handleAnalyze = () => {
    if (file) {
      onAnalyze('', file);
    } else if (text.trim()) {
      onAnalyze(text);
    } else {
      toast.error('Please enter text or upload a file to analyze');
    }
  };

  const clearFile = () => {
    setFile(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-white/90">Input Text</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            disabled={!text}
            className="flex items-center gap-1 text-sm text-white/60 hover:text-white/90 disabled:opacity-50"
          >
            <FiCopy className="w-4 h-4" />
            Copy
          </button>
          <button
            onClick={handlePaste}
            className="flex items-center gap-1 text-sm text-white/60 hover:text-white/90"
          >
            <FiUpload className="w-4 h-4" />
            Paste
          </button>
        </div>
      </div>

      {!file ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter or paste your text here..."
          maxLength={maxLength}
          disabled={isLoading}
          className="w-full h-[400px] rounded-lg p-4 bg-black/40 backdrop-blur-sm border border-white/10 text-white/90 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50"
        />
      ) : (
        <div className="relative w-full h-[400px] rounded-lg p-4 bg-black/40 backdrop-blur-sm border border-white/10 flex flex-col items-center justify-center">
          <FiFile className="w-12 h-12 text-white/40 mb-2" />
          <p className="text-white/90 font-medium">{file.name}</p>
          <p className="text-white/60 text-sm">
            {(file.size / 1024 / 1024).toFixed(2)}MB
          </p>
          <button
            onClick={clearFile}
            className="absolute top-2 right-2 text-white/60 hover:text-white/90"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
      )}

      {!file && (
        <div {...getRootProps()} className="mt-4">
          <input {...getInputProps()} />
          <div className={`w-full rounded-lg border-2 border-dashed ${isDragActive ? 'border-purple-500/50 bg-purple-500/5' : 'border-white/10'} p-4 text-center cursor-pointer transition-colors`}>
            <FiUpload className="w-6 h-6 text-white/40 mx-auto mb-2" />
            <p className="text-white/60">
              {isDragActive ? 'Drop the file here' : 'Drag & drop a file here, or click to select'}
            </p>
            <p className="text-white/40 text-sm mt-1">
              Supported formats: TXT, PDF, DOC, DOCX (max 5MB)
            </p>
          </div>
        </div>
      )}

      <button
        onClick={handleAnalyze}
        disabled={isLoading || (!text.trim() && !file) || text.length > maxLength}
        className="w-full inline-flex items-center justify-center gap-2 px-6 py-2.5 mt-4 text-sm font-medium text-white rounded-full shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        style={{ backgroundColor: 'var(--accent-500)', boxShadow: '0 18px 40px rgba(94,23,235,0.12)' }}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <span>Analyze {file ? 'File' : 'Text'}</span>
          </>
        )}
      </button>

      {text && (
        <p className="text-sm text-white/60 text-right">
          {text.length} / {maxLength} characters
        </p>
      )}
    </div>
  );
}