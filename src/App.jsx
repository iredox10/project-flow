
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import StudentDashboard from './pages/StudentDashboard';
import ProposalPage from './pages/ProposalPage';
import AdminDashboard from './pages/AdminDashboard';
import ManageUsersPage from './pages/ManageUsersPage';
import AssignSupervisorPage from './pages/AssignSupervisorPage';
import SupervisorDashboard from './pages/supervisor/SupervisorDashboard';
import ReviewProposalPage from './pages/supervisor/ReviewProposalPage';
import AllProjectsPage from './pages/supervisor/AllProjectsPage';
import ViewProjectPage from './pages/supervisor/ViewProjectPage';
import ChapterEditorPage from './pages/supervisor/ChapterEditorPage'; // New import

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<LandingPage />} />

        {/* Student Routes */}
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/proposal" element={<ProposalPage />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<ManageUsersPage />} />
        <Route path="/admin/assign-supervisor" element={<AssignSupervisorPage />} />

        {/* Supervisor Routes */}
        <Route path="/supervisor/dashboard" element={<SupervisorDashboard />} />
        <Route path="/supervisor/proposal/:id" element={<ReviewProposalPage />} />
        <Route path="/supervisor/projects" element={<AllProjectsPage />} />
        <Route path="/supervisor/project/:id" element={<ViewProjectPage />} />
        <Route path="/supervisor/project/:projectId/chapter/:chapterId" element={<ChapterEditorPage />} /> {/* New Route */}

      </Routes>
    </BrowserRouter>
  );
}

export default App;
