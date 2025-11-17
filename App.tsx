
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './app/login/page';
import SignupPage from './app/signup/page';
import ForgotPasswordPage from './app/forgot-password/page';
import DashboardLayout from './app/dashboard/layout';
import DashboardPage from './app/dashboard/page';
import QABenchmarkPage from './app/dashboard/qa/page';
import ReportsPage from './app/dashboard/reports/page';
import FeedbackPage from './app/dashboard/feedback/page';
import SettingsPage from './app/dashboard/settings/page';
import SqlPage from './app/dashboard/sql/page';
import ProtectedRoute from './components/protected-route';
import { Toaster } from './components/ui/Toaster';

// FIX: Add type declaration for lucide on window object
declare global {
  interface Window {
    lucide: {
      // FIX: Corrected the type for createIcons to `() => void` to resolve a declaration conflict.
      createIcons: () => void;
    };
  }
}

const App: React.FC = () => {
  useEffect(() => {
    // This is to replace the classList on the body element
    // To support dark mode
    const body = document.body;
    body.classList.add('bg-secondary', 'dark:bg-dark-secondary');

    // Initialize lucide icons
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }, []);

  return (
    <>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<DashboardPage />} />
            <Route path="qa" element={<QABenchmarkPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="feedback" element={<FeedbackPage />} />
            <Route path="sql" element={<SqlPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard/overview" />} />
        </Routes>
      </HashRouter>
      <Toaster />
    </>
  );
};

export default App;
