import { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider, redirect } from 'react-router-dom';
import { Toaster } from 'sonner';
import ErrorBoundary from '@/components/ErrorBoundary';
import RouteError from '@/components/RouteError';
import { Layout } from '@/components/Layout';
import { PrivateRoute } from '@/components/PrivateRoute';
import { AuthProvider } from '@/context/AuthContext';
import { SubscriptionProvider } from '@/context/SubscriptionContext';
import AnalysisProvider from '@/context/AnalysisContext';
import { AnalyticsProvider } from '@/context/AnalyticsContext';
import { ShobeisProvider } from '@/context/ShobeisContext';

// Lazy load pages for better performance
const HomePage = lazy(() => import('@/pages/HomePage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const AnalyzePage = lazy(() => import('@/pages/AnalyzePage'));
const HistoryPage = lazy(() => import('@/pages/HistoryPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const PricingPage = lazy(() => import('@/pages/PricingPage'));
const BillingPage = lazy(() => import('@/pages/BillingPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const VerifyEmailPage = lazy(() => import('@/pages/VerifyEmailPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'));
const ApiKeysPage = lazy(() => import('@/pages/ApiKeysPage'));
const AnalyzeProPage = lazy(() => import('@/pages/AnalyzeProPage'));
const ShobeisPage = lazy(() => import('@/pages/ShobeisPage'));

// Loading component for lazy-loaded pages
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-primary-50 to-white">
    <div className="relative">
      <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-accent-500 animate-spin"></div>
      <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-b-4 border-accent-700 animate-spin delay-150"></div>
    </div>
    <p className="mt-4 text-accent-500 font-medium">Loading...</p>
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
                <AnalyticsProvider>
                  <ShobeisProvider>
                    <Layout />
                  </ShobeisProvider>
                </AnalyticsProvider>
              </AnalysisProvider>
            </SubscriptionProvider>
          </AuthProvider>
        ),
        children: [
          // Public routes
          { 
            index: true, 
            element: <HomePage />,
          },
          { 
            path: 'about', 
            element: <AboutPage /> 
          },
          { 
            path: 'pricing', 
            element: <PricingPage /> 
          },
          { 
            path: 'analyze', 
            element: <AnalyzePage /> // Public version with limited features
          },
          { 
            path: 'contact', 
            element: <ContactPage /> 
          },

          // Authentication routes
          { 
            path: 'login', 
            element: <LoginPage />,
            loader: () => {
              const token = localStorage.getItem('access_token');
              if (token) return redirect('/dashboard');
              return null;
            },
          },
          {
            path: 'register',
            element: <RegisterPage />,
            loader: () => {
              const token = localStorage.getItem('access_token');
              if (token) return redirect('/dashboard');
              return null;
            },
          },
          {
            path: 'verify-email',
            element: <VerifyEmailPage />
          },
          {
            path: 'forgot-password',
            element: <ForgotPasswordPage />
          },
          {
            path: 'reset-password',
            element: <ResetPasswordPage />
          },

          // Protected routes - require authentication
          { 
            path: 'dashboard', 
            element: <PrivateRoute><DashboardPage /></PrivateRoute>,
            errorElement: <RouteError />
          },
          {
            path: 'profile',
            element: <PrivateRoute requireVerified><ProfilePage /></PrivateRoute>
          },
          { 
            path: 'history', 
            element: <PrivateRoute><HistoryPage /></PrivateRoute>
          },
          {
            path: 'analyze-pro',
            element: <PrivateRoute allowTrial><AnalyzeProPage /></PrivateRoute>
          },
          
          // Protected routes - require verified email
          { 
            path: 'settings', 
            element: <PrivateRoute requireVerified><SettingsPage /></PrivateRoute>
          },
          { 
            path: 'billing', 
            element: <PrivateRoute requireVerified><BillingPage /></PrivateRoute>
          },
          {
            path: 'shobeis',
            element: <PrivateRoute requireVerified><ShobeisPage /></PrivateRoute>
          },
          {
            path: 'api-keys',
            element: <PrivateRoute requireVerified><ApiKeysPage /></PrivateRoute>
          },

          // 404 route
          { 
            path: '*', 
            element: <NotFoundPage /> 
          },
        ],
      },
    ],
    {
      future: {
        // Using any to handle future flags that aren't in the current types
        ...(({ v7_startTransition: true }) as any),
        v7_normalizeFormMethod: true,
      }
    }
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
