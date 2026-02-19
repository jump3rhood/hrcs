import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import { useBootstrapAuth } from './hooks/useBootstrapAuth';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

import CandidateProfilePage from './pages/candidate/ProfilePage';
import CandidateJobsPage from './pages/candidate/JobsPage';
import CandidateApplicationsPage from './pages/candidate/ApplicationsPage';
import CandidateNotificationsPage from './pages/candidate/NotificationsPage';
import CandidateJobDetailPage from './pages/candidate/JobDetailPage';

import EmployerProfilePage from './pages/employer/ProfilePage';
import EmployerJobsPage from './pages/employer/JobsPage';
import EmployerJobFormPage from './pages/employer/JobFormPage';
import EmployerShortlistPage from './pages/employer/ShortlistPage';

import AdminCandidatesPage from './pages/admin/CandidatesPage';
import AdminJobsPage from './pages/admin/JobsPage';
import AdminShortlistPage from './pages/admin/ShortlistPage';
import AdminSendNotificationsPage from './pages/admin/SendNotificationsPage';
import AdminJobApplicationsPage from './pages/admin/JobApplicationsPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import EmployerNotificationsPage from './pages/employer/NotificationsPage';

export default function App() {
  useBootstrapAuth();
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Candidate routes */}
        <Route element={<ProtectedRoute allowedRoles={['candidate']} />}>
          <Route path="/candidate/profile" element={<CandidateProfilePage />} />
          <Route path="/candidate/jobs" element={<CandidateJobsPage />} />
          <Route path="/candidate/jobs/:jobId" element={<CandidateJobDetailPage />} />
          <Route path="/candidate/applications" element={<CandidateApplicationsPage />} />
          <Route path="/candidate/notifications" element={<CandidateNotificationsPage />} />
        </Route>

        {/* Employer routes */}
        <Route element={<ProtectedRoute allowedRoles={['employer']} />}>
          <Route path="/employer/profile" element={<EmployerProfilePage />} />
          <Route path="/employer/jobs" element={<EmployerJobsPage />} />
          <Route path="/employer/jobs/new" element={<EmployerJobFormPage />} />
          <Route path="/employer/jobs/:jobId/edit" element={<EmployerJobFormPage />} />
          <Route path="/employer/jobs/:jobId/shortlist" element={<EmployerShortlistPage />} />
          <Route path="/employer/notifications" element={<EmployerNotificationsPage />} />
        </Route>

        {/* Admin routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin/candidates" element={<AdminCandidatesPage />} />
          <Route path="/admin/jobs" element={<AdminJobsPage />} />
          <Route path="/admin/jobs/:jobId/applications" element={<AdminJobApplicationsPage />} />
          <Route path="/admin/jobs/:jobId/shortlist" element={<AdminShortlistPage />} />
          <Route path="/admin/jobs/:jobId/notify" element={<AdminSendNotificationsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
