
import React from 'react';
import { Link } from 'react-router-dom';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import { FiUsers, FiUserCheck, FiShield } from 'react-icons/fi';

// Mock data for the dashboard summary
const stats = {
  totalUsers: 142, // Students + Supervisors
  totalAdmins: 4,
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


const SuperAdminDashboard = () => {
  return (
    <SuperAdminLayout>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Super Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={<FiUsers size={24} className="text-blue-500" />}
          title="Total Users"
          value={stats.totalUsers}
          color="bg-blue-100"
        />
        <StatCard
          icon={<FiShield size={24} className="text-red-500" />}
          title="Total Admins"
          value={stats.totalAdmins}
          color="bg-red-100"
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/super-admin/manage-admins" className="bg-red-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-red-700 transition-colors">
            Manage Admins
          </Link>
        </div>
      </div>

    </SuperAdminLayout>
  );
};

export default SuperAdminDashboard;
