import React from 'react';
import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';

export default function RouteError() {
  const error = useRouteError();
  
  let errorMessage = 'An unexpected error occurred';
  let title = 'Error';
  
  if (isRouteErrorResponse(error)) {
    switch (error.status) {
      case 404:
        title = '404 - Not Found';
        errorMessage = 'Sorry, the page you are looking for does not exist.';
        break;
      case 401:
        title = '401 - Unauthorized';
        errorMessage = 'You need to be logged in to access this page.';
        break;
      case 403:
        title = '403 - Forbidden';
        errorMessage = 'You do not have permission to access this page.';
        break;
      default:
        title = `${error.status} - Error`;
        errorMessage = error.data?.message || 'An error occurred while loading this page.';
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="max-w-xl w-full text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-accent-3 to-accent-2 bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="text-lg mb-8 text-gray-300">{errorMessage}</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-6 py-3 rounded-full bg-accent-3 text-black font-semibold hover:bg-accent-2 transition-colors"
          >
            Go Home
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-full bg-gray-700 text-white font-semibold hover:bg-gray-600 transition-colors"
          >
            Try Again
          </button>
        </div>

        <div className="mt-8 text-sm text-gray-400">
          If this problem persists, please{" "}
          <Link to="/contact" className="text-accent-3 hover:text-accent-2 underline">
            contact support
          </Link>
          .
        </div>
      </div>
    </div>
  );
}