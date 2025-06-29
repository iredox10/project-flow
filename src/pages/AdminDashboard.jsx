
import React from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { FiUsers, FiUserCheck, FiFileText } from 'react-icons/fi';

// Mock data for the dashboard summary
const stats = {
  totalStudents: 124,
  totalSupervisors: 18,
  projectsInProgress: 89,
  pendingProposals: 12,
};

const StatCard = ({ icon, title, value, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
    <div className={`p-4 rounded-full mr-4 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);


const AdminDashboard = () => {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<FiUsers size={24} className="text-blue-500" />}
          title="Total Students"
          value={stats.totalStudents}
          color="bg-blue-100"
        />
        <StatCard
          icon={<FiUserCheck size={24} className="text-green-500" />}
          title="Total Supervisors"
          value={stats.totalSupervisors}
          color="bg-green-100"
        />
        <StatCard
          icon={<FiFileText size={24} className="text-indigo-500" />}
          title="Projects In Progress"
          value={stats.projectsInProgress}
          color="bg-indigo-100"
        />
        <StatCard
          icon={<FiFileText size={24} className="text-yellow-500" />}
          title="Pending Proposals"
          value={stats.pendingProposals}
          color="bg-yellow-100"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/admin/add-user" className="bg-purple-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
            Add New User
          </Link>
          <Link to="/admin/users" className="bg-gray-200 text-gray-800 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
            Manage All Users
          </Link>
        </div>
      </div>

    </AdminLayout>
  );
};

export default AdminDashboard;
