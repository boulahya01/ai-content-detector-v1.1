import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="text-8xl font-black text-accent mb-4 animate-pulse">404</div>
        <h1 className="text-3xl font-bold text-foreground mb-4">Page Not Found</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl text-base font-medium bg-accent hover:bg-accent-600 text-white shadow-lg hover:shadow-accent/25 transition-all duration-200"
          >
            Go Home
          </Link>
          <Link
            to="/analysis"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-indigo-600 text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 transition-colors duration-200"
          >
            Try Analysis
          </Link>
        </div>
      </div>
    </div>
  );
}