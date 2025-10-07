import React from 'react';

interface FilePreviewProps {
  content: string;
  fileName: string;
  fileType: string;
}

export function FilePreview({ content, fileName, fileType }: FilePreviewProps) {
  return (
    <div className="mt-4 border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-700">
          {fileName} <span className="text-gray-500">({fileType})</span>
        </h4>
      </div>
      <div className="relative">
        <pre className="text-sm bg-gray-50 rounded-md p-4 overflow-auto max-h-[400px] whitespace-pre-wrap">
          {content}
        </pre>
      </div>
    </div>
  );
}