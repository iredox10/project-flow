
import React from 'react';
import { Link } from 'react-router-dom';
import SupervisorLayout from '../../components/SupervisorLayout';
import { FiUsers, FiFilePlus, FiClock } from 'react-icons/fi';

// Mock Data for the supervisor's dashboard
const supervisorData = {
  name: 'Dr. Alan Turing',
  stats: {
    supervising: 3,
    pendingProposals: 2,
    activeProjects: 1,
  },
  pendingProposals: [
    { id: 1, studentName: 'Ethan Hunt', projectTitle: 'Advanced Cryptography Techniques' },
    { id: 2, studentName: 'Fiona Glenanne', projectTitle: 'Machine Learning for Anomaly Detection' },
  ]
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

const SupervisorDashboard = () => {
  return (
    <SupervisorLayout>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Welcome, {supervisorData.name}</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={<FiUsers size={24} className="text-blue-500" />}
          title="Supervising"
          value={supervisorData.stats.supervising}
          color="bg-blue-100"
        />
        <StatCard
          icon={<FiFilePlus size={24} className="text-yellow-500" />}
          title="Pending Proposals"
          value={supervisorData.stats.pendingProposals}
          color="bg-yellow-100"
        />
        <StatCard
          icon={<FiClock size={24} className="text-green-500" />}
          title="Active Projects"
          value={supervisorData.stats.activeProjects}
          color="bg-green-100"
        />
      </div>

      {/* Pending Proposals List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Pending Proposals for Review</h2>
        <div className="space-y-4">
          {supervisorData.pendingProposals.length > 0 ? (
            supervisorData.pendingProposals.map(proposal => (
              <div key={proposal.id} className="flex flex-col md:flex-row items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-800">{proposal.projectTitle}</p>
                  <p className="text-sm text-gray-500">Submitted by: {proposal.studentName}</p>
                </div>
                <Link to={`/supervisor/proposal/${proposal.id}`} className="mt-2 md:mt-0 bg-teal-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-teal-700 transition-colors">
                  Review Proposal
                </Link>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No pending proposals at this time.</p>
          )}
        </div>
      </div>

    </SupervisorLayout>
  );
};

export default SupervisorDashboard;
