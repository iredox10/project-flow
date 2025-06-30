
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiGrid, FiFilePlus, FiBook, FiUser, FiLogOut, FiBookOpen, FiBell, FiCheckCircle, FiMessageSquare } from 'react-icons/fi';

// Mock data for student notifications
const studentNotifications = [
  { id: 1, type: 'feedback', text: 'Dr. Turing left new feedback on Chapter 3.', read: false },
  { id: 2, type: 'approval', text: 'Chapter 2 has been approved.', read: false },
  { id: 3, type: 'deadline', text: 'A new deadline has been set for Chapter 4.', read: true },
];

// --- Reusable Notification Panel Component ---
const NotificationPanel = ({ notifications, onClose }) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case 'feedback': return <FiMessageSquare className="text-blue-500" />;
      case 'approval': return <FiCheckCircle className="text-green-500" />;
      default: return <FiBell className="text-gray-500" />;
    }
  }

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-20">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-800">Notifications</h3>
        {unreadCount > 0 && <p className="text-xs text-blue-600">{unreadCount} unread</p>}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.map(notification => (
          <div key={notification.id} className={`p-4 border-b hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}>
            <div className="flex items-start gap-3">
              {getIcon(notification.type)}
              <p className="text-sm text-gray-700">{notification.text}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-2 text-center">
        <Link to="#" className="text-sm font-medium text-blue-600 hover:underline">View all notifications</Link>
      </div>
    </div>
  )
};


const SidebarLink = ({ to, icon, children }) => (
  <Link to={to} className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors duration-200">
    {icon}
    <span className="ml-3 font-medium">{children}</span>
  </Link>
);

const StudentLayout = ({ children }) => {
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const unreadCount = studentNotifications.filter(n => !n.read).length;

  const handleLogout = () => navigate('/');

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex-shrink-0 z-10">
        <div className="p-6">
          <Link to="/" className="flex items-center space-x-2">
            <FiBookOpen className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">Projeckt</span>
          </Link>
        </div>
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Student Panel</h3>
        </div>
        <nav className="mt-6 px-4 space-y-2">
          <SidebarLink to="/student/dashboard" icon={<FiGrid size={20} />}>Dashboard</SidebarLink>
          <SidebarLink to="/student/proposal" icon={<FiFilePlus size={20} />}>Project Proposal</SidebarLink>
          <SidebarLink to="/student/my-project" icon={<FiBook size={20} />}>My Project</SidebarLink>
          <SidebarLink to="/student/profile" icon={<FiUser size={20} />}>Profile</SidebarLink>
        </nav>
        <div className="absolute bottom-0 w-64 p-4">
          <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors duration-200">
            <FiLogOut size={20} />
            <span className="ml-3 font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="bg-white shadow-sm p-4 flex justify-end items-center">
          <div className="relative">
            <button onClick={() => setNotificationsOpen(prev => !prev)} className="relative text-gray-600 hover:text-blue-600">
              <FiBell size={24} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {unreadCount}
                </span>
              )}
            </button>
            {notificationsOpen && <NotificationPanel notifications={studentNotifications} onClose={() => setNotificationsOpen(false)} />}
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
