
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import page components
import LandingPage from './pages/LandingPage';

// Student Pages (with updated paths)
import StudentDashboard from './pages/student/StudentDashboard';
import ProposalPage from './pages/student/ProposalPage';
import MyProjectPage from './pages/student/MyProjectPage';
import StudentChapterEditorPage from './pages/student/ChapterEditorPage';
import ProfilePage from './pages/student/ProfilePage';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import ManageUsersPage from './pages/ManageUsersPage';
import AssignSupervisorPage from './pages/AssignSupervisorPage';

// Supervisor Pages
import SupervisorDashboard from './pages/supervisor/SupervisorDashboard';
import ReviewProposalPage from './pages/supervisor/ReviewProposalPage';
import AllProjectsPage from './pages/supervisor/AllProjectsPage';
import ViewProjectPage from './pages/supervisor/ViewProjectPage';
import ChapterEditorPage from './pages/supervisor/ChapterEditorPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<LandingPage />} />

        {/* --- Student Routes --- */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/proposal" element={<ProposalPage />} />
        <Route path="/student/my-project" element={<MyProjectPage />} />
        <Route path="/student/project" element={<MyProjectPage />} />
        <Route path="/student/project/:projectId/chapter/:chapterId" element={<StudentChapterEditorPage />} />
        <Route path="/student/profile" element={<ProfilePage />} />

        {/* --- Admin Routes --- */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<ManageUsersPage />} />
        <Route path="/admin/assign-supervisor" element={<AssignSupervisorPage />} />

        {/* --- Supervisor Routes --- */}
        <Route path="/supervisor/dashboard" element={<SupervisorDashboard />} />
        <Route path="/supervisor/proposal/:id" element={<ReviewProposalPage />} />
        <Route path="/supervisor/projects" element={<AllProjectsPage />} />
        <Route path="/supervisor/project/:id" element={<ViewProjectPage />} />
        <Route path="/supervisor/project/:projectId/chapter/:chapterId" element={<ChapterEditorPage />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
