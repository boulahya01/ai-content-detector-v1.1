import { Suspense, lazy } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { SubscriptionProvider } from './context/SubscriptionContext';
import AnalysisProvider from './context/AnalysisContext';
import { Layout } from './components/Layout';
import { PrivateRoute } from './components/PrivateRoute';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AnalyzePage = lazy(() => import('./pages/AnalyzePage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const BillingPage = lazy(() => import('./pages/BillingPage'));

// Loading component for lazy-loaded pages
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

function App() {
  const router = createBrowserRouter(
    [
      {
        path: '/',
        element: (
          <AuthProvider>
            <SubscriptionProvider>
              <AnalysisProvider>
                <Layout />
              </AnalysisProvider>
            </SubscriptionProvider>
          </AuthProvider>
        ),
        children: [
          { index: true, element: <HomePage /> },
          { path: 'login', element: <LoginPage /> },
          { path: 'pricing', element: <PricingPage /> },
          { path: 'billing', element: <BillingPage /> },
          { path: 'dashboard', element: <PrivateRoute><DashboardPage /></PrivateRoute> },
          { path: 'analyze', element: <AnalyzePage /> },
          { path: 'history', element: <PrivateRoute><HistoryPage /></PrivateRoute> },
          { path: 'settings', element: <PrivateRoute><SettingsPage /></PrivateRoute> },
        ],
      },
    ],
    // Opt-in to v7 future flags to silence upgrade warnings. cast to any to avoid TS type mismatches
    ({ future: { v7_startTransition: true, v7_relativeSplatPath: true } } as any)
  );

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <RouterProvider router={router} />
      </Suspense>
      <Toaster />
    </ErrorBoundary>
  );
}

export default App;
