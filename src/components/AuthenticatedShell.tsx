import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';

import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { DesignSystemPage } from '../pages/DesignSystemPage';
import { DashboardOverviewPage } from '../pages/DashboardOverviewPage';
import { DashboardProfilePage } from '../pages/DashboardProfilePage';
import { DashboardPaymentMethodsPage } from '../pages/DashboardPaymentMethodsPage';
import { DashboardSettingsPage } from '../pages/DashboardSettingsPage';
import { DashboardSecurityPage } from '../pages/DashboardSecurityPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export default function AuthenticatedShell() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/design-system" element={<DesignSystemPage />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardOverviewPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/profile"
          element={
            <ProtectedRoute>
              <DashboardProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/payment-methods"
          element={
            <ProtectedRoute>
              <DashboardPaymentMethodsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/settings"
          element={
            <ProtectedRoute>
              <DashboardSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/security"
          element={
            <ProtectedRoute>
              <DashboardSecurityPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AuthProvider>
  );
}
