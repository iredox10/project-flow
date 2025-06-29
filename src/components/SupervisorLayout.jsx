
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiGrid, FiFileText, FiMessageSquare, FiUser, FiLogOut, FiBookOpen } from 'react-icons/fi';

const SidebarLink = ({ to, icon, children }) => (
  <Link to={to} className="flex items-center px-4 py-3 text-gray-700 hover:bg-teal-50 rounded-lg transition-colors duration-200">
    {icon}
    <span className="ml-3 font-medium">{children}</span>
  </Link>
);

const SupervisorLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex-shrink-0">
        <div className="p-6">
          <Link to="/" className="flex items-center space-x-2">
            <FiBookOpen className="w-8 h-8 text-teal-600" />
            <span className="text-2xl font-bold text-gray-900">Projeckt</span>
          </Link>
        </div>
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Supervisor Panel</h3>
          <p className="text-sm text-gray-500">Student Management</p>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          <SidebarLink to="/supervisor/dashboard" icon={<FiGrid size={20} />}>Dashboard</SidebarLink>
          <SidebarLink to="/supervisor/projects" icon={<FiFileText size={20} />}>All Projects</SidebarLink>
          <SidebarLink to="/supervisor/messages" icon={<FiMessageSquare size={20} />}>Messages</SidebarLink>
          <SidebarLink to="/supervisor/profile" icon={<FiUser size={20} />}>Profile</SidebarLink>
        </nav>
        <div className="absolute bottom-0 w-64 p-4">
          <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-teal-50 rounded-lg transition-colors duration-200">
            <FiLogOut size={20} />
            <span className="ml-3 font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SupervisorLayout;
