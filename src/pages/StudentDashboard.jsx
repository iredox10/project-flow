
/*
 * ===============================================================
 * FILE: src/pages/StudentDashboard.jsx
 * ===============================================================
 * This is the main dashboard page for a logged-in student.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { FiFileText, FiMessageSquare, FiClock, FiCheckCircle } from 'react-icons/fi';

// Mock data - in a real app, this would come from an API
const project = {
  status: 'approved', // 'none', 'submitted', 'approved', 'rejected'
  title: 'The Impact of AI on Modern Web Development',
  supervisor: 'Dr. Ada Lovelace',
  recentFeedback: 'Chapter 2 looks good, but please add more citations for the literature review section.',
};


const ProjectStatus = () => {
  switch (project.status) {
    case 'approved':
      return (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <FiCheckCircle className="text-green-500 mr-3" size={24} />
            <h3 className="text-xl font-semibold text-gray-800">Project Approved</h3>
          </div>
          <p className="text-gray-600 mb-2 font-medium">{project.title}</p>
          <p className="text-gray-500 text-sm">Supervisor: {project.supervisor}</p>
          <Link to="/my-project" className="inline-block mt-4 bg-indigo-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
            View Project Details
          </Link>
        </div>
      );
    case 'submitted':
      return (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <FiClock className="text-yellow-500 mr-3" size={24} />
            <h3 className="text-xl font-semibold text-gray-800">Proposal Submitted</h3>
          </div>
          <p className="text-gray-600">Your proposal is currently under review by your supervisor. You'll be notified of any updates.</p>
        </div>
      );
    default:
      return (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <FiFileText className="mx-auto text-gray-400 mb-4" size={40} />
          <h3 className="text-xl font-semibold text-gray-800">No Project Yet</h3>
          <p className="text-gray-600 my-2">You haven't proposed a project topic yet. Get started now!</p>
          <Link to="/proposal" className="inline-block mt-2 bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
            Propose a Project
          </Link>
        </div>
      )
  }
}

const StudentDashboard = () => {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Welcome, Student!</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Project Overview</h2>
            <ProjectStatus />
          </section>
        </div>
        {/* Right Sidebar */}
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recent Feedback</h2>
            {project.recentFeedback ? (
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-start">
                  <FiMessageSquare className="text-indigo-500 mr-4 mt-1 flex-shrink-0" size={20} />
                  <p className="text-gray-600">{project.recentFeedback}</p>
                </div>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <p className="text-gray-500">No new feedback from your supervisor.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
