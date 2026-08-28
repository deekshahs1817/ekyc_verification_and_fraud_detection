import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { AppThemeProvider } from './theme/ThemeContext';
import { RootState } from './store';
import { Navbar } from './components/common/Navbar';
import { LoginPage } from './pages/LoginPage';
import { UserKYCPage } from './pages/UserKYCPage';
import { KYCStatusPage } from './pages/KYCStatusPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminKYCReviewPage } from './pages/AdminKYCReviewPage';
import { AdminApplicantDossierPage } from './pages/AdminApplicantDossierPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { EnterprisePage } from './pages/EnterprisePage';
import { CompleteProfilePage } from './pages/CompleteProfilePage';

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles?: string[];
  requireProfileCompleted?: boolean;
}

const ProtectedRoute = ({
  children,
  allowedRoles,
  requireProfileCompleted = true,
}: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Mandatory Profile Completion Gatekeeper
  if (
    requireProfileCompleted &&
    user?.role === 'USER' &&
    user?.profile_completed === false
  ) {
    return <Navigate to="/complete-profile" replace />;
  }

  // Role Access Control
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to={
          user.role === 'ADMIN' || user.role === 'COMPLIANCE_OFFICER'
            ? '/admin'
            : '/kyc/submit'
        }
        replace
      />
    );
  }

  return children;
};

export const App: React.FC = () => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <AppThemeProvider>
      <CssBaseline />
      <Router basename={process.env.PUBLIC_URL || ''}>
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <Box sx={{ flexGrow: 1 }}>
            <Routes>
              {/* Root Navigation Logic */}
              <Route
                path="/"
                element={
                  isAuthenticated ? (
                    user?.role === 'ADMIN' || user?.role === 'COMPLIANCE_OFFICER' ? (
                      <Navigate to="/admin" replace />
                    ) : user?.profile_completed === false ? (
                      <Navigate to="/complete-profile" replace />
                    ) : (
                      <Navigate to="/kyc/submit" replace />
                    )
                  ) : (
                    <EnterprisePage />
                  )
                }
              />

              {/* Public Auth & Overview Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<Navigate to="/login" replace />} />
              <Route path="/overview" element={<EnterprisePage />} />
              <Route path="/enterprise" element={<EnterprisePage />} />

              {/* Profile Completion Onboarding Route */}
              <Route
                path="/complete-profile"
                element={
                  <ProtectedRoute requireProfileCompleted={false}>
                    <CompleteProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Applicant Protected Routes */}
              <Route
                path="/kyc/submit"
                element={
                  <ProtectedRoute>
                    <UserKYCPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kyc/status"
                element={
                  <ProtectedRoute>
                    <KYCStatusPage />
                  </ProtectedRoute>
                }
              />

              {/* Compliance & Admin Protected Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'COMPLIANCE_OFFICER']}>
                    <AdminDashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/review/:id"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'COMPLIANCE_OFFICER']}>
                    <AdminKYCReviewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/applicant/:id"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'COMPLIANCE_OFFICER']}>
                    <AdminApplicantDossierPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/audit"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN', 'COMPLIANCE_OFFICER']}>
                    <AuditLogsPage />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </AppThemeProvider>
  );
};

export default App;
