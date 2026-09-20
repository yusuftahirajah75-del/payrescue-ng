import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout & Guards
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute, RoleGuard, TenantGuard } from './components/guard/RouteGuards';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { PublicStatusPage } from './pages/public/PublicStatusPage';
import { LegalTermsPage, LegalPrivacyPage } from './pages/public/LegalPages';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage, ForgotPasswordPage } from './pages/auth/RegisterAndForgotPages';

// Consumer Pages
import { ConsumerDashboard } from './pages/consumer/ConsumerDashboard';
import { WhereIsMyMoneyPage } from './pages/consumer/WhereIsMyMoneyPage';
import { CaseListPage } from './pages/consumer/CaseListPage';
import { CaseDetailPage } from './pages/consumer/CaseDetailPage';
import { EvidenceVaultPage } from './pages/consumer/EvidenceVaultPage';
import { TransactionsPage } from './pages/consumer/TransactionsPage';
import { ProfilePage } from './pages/consumer/ProfilePage';

// Business Pages
import { BusinessDashboard } from './pages/business/BusinessDashboard';
import { ReconciliationPage } from './pages/business/ReconciliationPage';
import { PaymentVerifyPage } from './pages/business/PaymentVerifyPage';
import { PaymentRequestsPage } from './pages/business/PaymentRequestsPage';
import { BusinessTeamPage } from './pages/business/BusinessTeamPage';
import { DeveloperPortalPage } from './pages/business/DeveloperPortalPage';
import { BusinessBillingPage } from './pages/business/BusinessBillingPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/status" element={<PublicStatusPage />} />
      <Route path="/terms" element={<LegalTermsPage />} />
      <Route path="/privacy" element={<LegalPrivacyPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Protected App Routes inside DashboardLayout */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Consumer Portal Routes */}
        <Route path="/dashboard" element={<ConsumerDashboard />} />
        <Route path="/where-is-my-money" element={<WhereIsMyMoneyPage />} />
        <Route path="/consumer/where-is-my-money" element={<WhereIsMyMoneyPage />} />
        <Route path="/cases" element={<CaseListPage />} />
        <Route path="/consumer/cases" element={<CaseListPage />} />
        <Route path="/cases/:id" element={<CaseDetailPage />} />
        <Route path="/consumer/cases/:id" element={<CaseDetailPage />} />
        <Route path="/evidence" element={<EvidenceVaultPage />} />
        <Route path="/consumer/evidence" element={<EvidenceVaultPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/consumer/transactions" element={<TransactionsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/consumer/profile" element={<ProfilePage />} />

        {/* Business Tenant Routes */}
        <Route
          path="/business"
          element={
            <TenantGuard>
              <BusinessDashboard />
            </TenantGuard>
          }
        />
        <Route
          path="/business/reconciliation"
          element={
            <TenantGuard>
              <ReconciliationPage />
            </TenantGuard>
          }
        />
        <Route
          path="/business/verify"
          element={
            <TenantGuard>
              <PaymentVerifyPage />
            </TenantGuard>
          }
        />
        <Route
          path="/business/payment-verify"
          element={
            <TenantGuard>
              <PaymentVerifyPage />
            </TenantGuard>
          }
        />
        <Route
          path="/business/requests"
          element={
            <TenantGuard>
              <PaymentRequestsPage />
            </TenantGuard>
          }
        />
        <Route
          path="/business/team"
          element={
            <TenantGuard>
              <BusinessTeamPage />
            </TenantGuard>
          }
        />
        <Route
          path="/business/developer"
          element={
            <TenantGuard>
              <DeveloperPortalPage />
            </TenantGuard>
          }
        />
        <Route
          path="/business/billing"
          element={
            <TenantGuard>
              <BusinessBillingPage />
            </TenantGuard>
          }
        />

        {/* Admin Platform Routes */}
        <Route
          path="/admin"
          element={
            <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
              <AdminDashboard />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
              <AdminUsersPage />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/audit-logs"
          element={
            <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
              <AdminAuditLogsPage />
            </RoleGuard>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <RoleGuard allowedRoles={['SUPER_ADMIN', 'ADMIN']}>
              <AdminSettingsPage />
            </RoleGuard>
          }
        />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
