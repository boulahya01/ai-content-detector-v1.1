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
import { CreditsProvider } from '@/context/CreditsContext';
import AccountLayout from '@/pages/account/AccountLayout';

// Lazy load pages for better performance
const HomePage = lazy(() => import('@/pages/HomePage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const AnalysisPage = lazy(() => import('@/pages/AnalysisPage'));
const HistoryPage = lazy(() => import('@/pages/HistoryPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const PricingPage = lazy(() => import('@/pages/PricingPage'));
const BillingPage = lazy(() => import('@/pages/profile/BillingPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const VerifyEmailPage = lazy(() => import('@/pages/auth/EmailVerificationPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/auth/ResetPasswordPage'));
const ApiKeysPage = lazy(() => import('@/pages/profile/ApiKeysPage'));
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'));
const ShobeisPage = lazy(() => import('@/pages/ShobeisPage'));

// Documentation Pages
const DocumentationPage = lazy(() => import('@/pages/docs/DocumentationPage'));
const ApiGuidelinesPage = lazy(() => import('@/pages/docs/ApiGuidelinesPage'));
const BestPracticesPage = lazy(() => import('@/pages/docs/BestPracticesPage'));
const CaseStudiesPage = lazy(() => import('@/pages/docs/CaseStudiesPage'));
const IntegrationExamplesPage = lazy(() => import('@/pages/docs/IntegrationExamplesPage'));
const UsageStatsPage = lazy(() => import('@/pages/UsageStatsPage'));

// Loading component for lazy-loaded pages
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-background">
    <div className="relative">
      <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-accent-500 animate-spin"></div>
      <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-b-4 border-accent-300 animate-spin delay-150 opacity-50"></div>
    </div>
    <p className="mt-4 text-accent-300 font-medium animate-pulse">Loading...</p>
  </div>
);

function App() {
  const router = createBrowserRouter(
    [
      {
        path: '/',
        element: <Layout />,
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
            path: 'contact', 
            element: <ContactPage /> 
          },

          // Analysis routes
          {
            path: 'analysis',
            children: [
              {
                index: true,
                element: <PrivateRoute><AnalysisPage /></PrivateRoute>
              },
              {
                path: 'history',
                element: <PrivateRoute><HistoryPage /></PrivateRoute>
              }
            ]
          },

          // Documentation routes
          {
            path: 'docs',
            children: [
              {
                index: true,
                element: <DocumentationPage />
              },
              {
                path: 'api-guidelines',
                element: <PrivateRoute><ApiGuidelinesPage /></PrivateRoute>
              },
              {
                path: 'best-practices',
                element: <BestPracticesPage />
              },
              {
                path: 'case-studies',
                element: <CaseStudiesPage />
              },
              {
                path: 'integration-examples',
                element: <PrivateRoute><IntegrationExamplesPage /></PrivateRoute>
              }
            ]
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

          // Dashboard and account routes
          { 
            path: 'dashboard', 
            element: <PrivateRoute><DashboardPage /></PrivateRoute>,
            errorElement: <RouteError />
          },
          {
            path: 'account',
            element: <PrivateRoute requireVerified><AccountLayout /></PrivateRoute>,
            children: [
              {
                index: true,
                element: <ProfilePage />
              },
              {
                path: 'settings',
                element: <SettingsPage />
              },
              {
                path: 'billing',
                element: <BillingPage />
              },
              {
                path: 'api',
                element: <ApiKeysPage />
              },
              {
                path: 'credits',
                element: <ShobeisPage />
              }
            ]
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
      <AuthProvider>
          <SubscriptionProvider>
            <CreditsProvider>
              <AnalysisProvider>
                <AnalyticsProvider>
                  <ShobeisProvider>
                    <Suspense fallback={<LoadingSpinner />}>
                      <RouterProvider router={router} />
                    </Suspense>
                    <Toaster />
                  </ShobeisProvider>
                </AnalyticsProvider>
              </AnalysisProvider>
            </CreditsProvider>
          </SubscriptionProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
