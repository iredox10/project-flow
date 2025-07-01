
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiGrid, FiFileText, FiMessageSquare, FiUser, FiLogOut, FiBookOpen, FiBell, FiFilePlus } from 'react-icons/fi';

// Mock data for supervisor notifications
const supervisorNotifications = [
  { id: 1, type: 'submission', text: 'Ethan Hunt submitted Chapter 3 for review.', read: false },
  { id: 2, type: 'proposal', text: 'You have a new project proposal from Alice Johnson.', read: false },
  { id: 3, type: 'reply', text: 'Charlie Brown replied to your comment on Chapter 1.', read: true },
];

const NotificationPanel = ({ notifications }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'submission': return <FiFileText className="text-green-500" />;
      case 'proposal': return <FiFilePlus className="text-purple-500" />;
      default: return <FiBell className="text-gray-500" />;
    }
  }
  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-20">
      <div className="p-4 border-b"><h3 className="font-semibold text-gray-800">Notifications</h3></div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.map(n => (
          <div key={n.id} className={`p-4 border-b hover:bg-gray-50 ${!n.read ? 'bg-teal-50' : ''}`}>
            <div className="flex items-start gap-3">{getIcon(n.type)}<p className="text-sm text-gray-700">{n.text}</p></div>
          </div>
        ))}
      </div>
      <div className="p-2 text-center"><Link to="#" className="text-sm font-medium text-teal-600 hover:underline">View all</Link></div>
    </div>
  )
};

const SidebarLink = ({ to, icon, children }) => (
  <Link to={to} className="flex items-center px-4 py-3 text-gray-700 hover:bg-teal-50 rounded-lg transition-colors duration-200">
    {icon}<span className="ml-3 font-medium">{children}</span>
  </Link>
);

const SupervisorLayout = ({ children }) => {
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const unreadCount = supervisorNotifications.filter(n => !n.read).length;

  const handleLogout = () => navigate('/');

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-lg flex-shrink-0 z-10">
        <div className="p-6"><Link to="/" className="flex items-center space-x-2"><FiBookOpen className="w-8 h-8 text-teal-600" /><span className="text-2xl font-bold text-gray-900">Projeckt</span></Link></div>
        <div className="text-center mb-6"><h3 className="text-lg font-semibold text-gray-800">Supervisor Panel</h3></div>
        <nav className="mt-6 px-4 space-y-2">
          <SidebarLink to="/supervisor/dashboard" icon={<FiGrid size={20} />}>Dashboard</SidebarLink>
          <SidebarLink to="/supervisor/proposals" icon={<FiFilePlus size={20} />}>Proposals</SidebarLink>
          <SidebarLink to="/supervisor/projects" icon={<FiFileText size={20} />}>All Projects</SidebarLink>
          <SidebarLink to="/supervisor/messages" icon={<FiMessageSquare size={20} />}>Messages</SidebarLink>
          <SidebarLink to="/supervisor/profile" icon={<FiUser size={20} />}>Profile</SidebarLink>
        </nav>
        <div className="absolute bottom-0 w-64 p-4"><button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-teal-50 rounded-lg"><FiLogOut size={20} /><span className="ml-3 font-medium">Logout</span></button></div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm p-4 flex justify-end items-center">
          <div className="relative">
            <button onClick={() => setNotificationsOpen(prev => !prev)} className="relative text-gray-600 hover:text-teal-600">
              <FiBell size={24} />
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">{unreadCount}</span>}
            </button>
            {notificationsOpen && <NotificationPanel notifications={supervisorNotifications} onClose={() => setNotificationsOpen(false)} />}
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SupervisorLayout;
