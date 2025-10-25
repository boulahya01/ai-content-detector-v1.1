import React from 'react';

interface CodeBlockProps {
  language: string;
  code: string;
}

export function CodeBlock({ language, code }: CodeBlockProps) {
  return (
    <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto">
      <code className={`language-${language}`}>{code}</code>
    </pre>
  );
}