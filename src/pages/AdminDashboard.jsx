
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { FiUsers, FiUserCheck, FiFileText, FiLoader } from 'react-icons/fi';
import { db, collection, query, where, onSnapshot } from '../firebase/config';

// --- Reusable Stat Card Component ---
const StatCard = ({ icon, title, value, color, loading }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
    <div className={`p-4 rounded-full mr-4 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      {loading ? (
        <FiLoader className="animate-spin mt-2 text-gray-400" />
      ) : (
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      )}
    </div>
  </div>
);


const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);

  // Fetch all relevant data from Firestore
  useEffect(() => {
    const usersQuery = query(collection(db, "users"), where("role", "in", ["student", "supervisor"]));
    const projectsQuery = query(collection(db, "projects"));

    const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
      const fetchedUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(fetchedUsers);
      setUsersLoading(false); // Mark users as loaded
    });

    const unsubProjects = onSnapshot(projectsQuery, (snapshot) => {
      const fetchedProjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(fetchedProjects);
      setProjectsLoading(false); // Mark projects as loaded
    });

    return () => {
      unsubUsers();
      unsubProjects();
    };
  }, []);

  // Overall loading state is true if either data source is still loading
  const loading = usersLoading || projectsLoading;

  // Calculate stats based on live data
  const stats = useMemo(() => {
    return {
      totalStudents: users.filter(u => u.role === 'student').length,
      totalSupervisors: users.filter(u => u.role === 'supervisor').length,
      projectsInProgress: projects.filter(p => p.status === 'approved').length,
      pendingProposals: projects.filter(p => p.status === 'pending').length,
    }
  }, [users, projects]);


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
          loading={loading}
        />
        <StatCard
          icon={<FiUserCheck size={24} className="text-green-500" />}
          title="Total Supervisors"
          value={stats.totalSupervisors}
          color="bg-green-100"
          loading={loading}
        />
        <StatCard
          icon={<FiFileText size={24} className="text-indigo-500" />}
          title="Projects In Progress"
          value={stats.projectsInProgress}
          color="bg-indigo-100"
          loading={loading}
        />
        <StatCard
          icon={<FiFileText size={24} className="text-yellow-500" />}
          title="Pending Proposals"
          value={stats.pendingProposals}
          color="bg-yellow-100"
          loading={loading}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/admin/users" className="bg-purple-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
            Manage All Users
          </Link>
          <Link to="/admin/assign-supervisor" className="bg-gray-200 text-gray-800 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
            Assign Supervisors
          </Link>
        </div>
      </div>

    </AdminLayout>
  );
};

export default AdminDashboard;
