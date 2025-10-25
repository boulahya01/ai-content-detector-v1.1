import React from 'react';

export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent"></div>
    </div>
  );
}