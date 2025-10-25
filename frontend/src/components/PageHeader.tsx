import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold">{title}</h1>
      {description && <p className="mt-2 text-gray-600">{description}</p>}
    </div>
  );
}