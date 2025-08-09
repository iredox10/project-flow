
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Import the provider
// Page Imports
import StudentDashboard from './pages/student/StudentDashboard';
import LandingPage from './pages/LandingPage';
import MyProjectPage from './pages/student/MyProjectPage';
import ProposalPage from './pages/student/ProposalPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import StudentChapterEditorPage from './pages/student/ChapterEditorPage';
import ProfilePage from './pages/student/ProfilePage';
import StudentMessagesPage from './pages/student/MessagePage';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import ManageUsersPage from './pages/ManageUsersPage';
import AssignSupervisorPage from './pages/AssignSupervisorPage';
// Supervisor Pages
import SupervisorDashboard from './pages/supervisor/SupervisorDashboard';
import ReviewProposalPage from './pages/supervisor/ReviewProposalPage';
import AllProjectsPage from './pages/supervisor/AllProjectsPage';
import ViewProjectPage from './pages/supervisor/ViewProjectPage';
import SupervisorChapterEditorPage from './pages/supervisor/ChapterEditorPage';
import SupervisorProfilePage from './pages/supervisor/ProfilePage';
import ProposalsPage from './pages/supervisor/ProposalsPage';
import MessagesPage from './pages/supervisor/MessaagePage';
// Super Admin Pages
import SuperAdminDashboard from './pages/super-admin/SuperAdminDashboard';
import ManageAdminsPage from './pages/super-admin/ManageAdminsPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route */}
          <Route path="/" element={<LandingPage />} />

          {/* --- Student Routes --- */}
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/proposal" element={<ProposalPage />} />
          <Route path="/student/my-project" element={<MyProjectPage />} />
          <Route path="/student/project/:projectId/chapter/:chapterId" element={<StudentChapterEditorPage />} />
          <Route path="/student/profile" element={<ProfilePage />} />
          <Route path="/student/messages" element={<StudentMessagesPage />} />
          <Route path="/student/announcements" element={<AnnouncementsPage />} />

          {/* --- Admin Routes --- */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<ManageUsersPage />} />
          <Route path="/admin/assign-supervisor" element={<AssignSupervisorPage />} />

          {/* --- Supervisor Routes --- */}
          <Route path="/supervisor/dashboard" element={<SupervisorDashboard />} />
          <Route path="/supervisor/proposals" element={<ProposalsPage />} />
          <Route path="/supervisor/proposal/:id" element={<ReviewProposalPage />} />
          <Route path="/supervisor/projects" element={<AllProjectsPage />} />
          <Route path="/supervisor/project/:id" element={<ViewProjectPage />} />
          <Route path="/supervisor/project/:projectId/chapter/:chapterId" element={<SupervisorChapterEditorPage />} />
          <Route path="/supervisor/messages" element={<MessagesPage />} />
          <Route path="/supervisor/profile" element={<SupervisorProfilePage />} />

          {/* --- Super Admin Routes --- */}
          <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
          <Route path="/super-admin/manage-admins" element={<ManageAdminsPage />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
