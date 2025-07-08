
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiGrid,FiFilePlus, FiFileText, FiMessageSquare, FiUser, FiLogOut, FiBookOpen, FiBell, FiCheckCircle, FiFilePlus as FiSubmission } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { db, collection, query, where, onSnapshot, orderBy } from '../firebase/config';
import { formatDistanceToNow } from 'date-fns';

// --- Reusable Notification Panel Component ---
const NotificationPanel = ({ notifications, onClose }) => {
    const unreadCount = notifications.filter(n => !n.read).length;

    const getIcon = (type) => {
      switch(type) {
        case 'submission': return <FiSubmission className="text-green-500" />;
        case 'proposal': return <FiFileText className="text-purple-500" />;
        default: return <FiBell className="text-gray-500" />;
      }
    }

    return (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-20">
            <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">Notifications</h3>
                {unreadCount > 0 && <span className="text-xs font-bold text-white bg-red-500 rounded-full px-2 py-0.5">{unreadCount} New</span>}
            </div>
            <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? notifications.map(notification => (
                    <Link to={notification.link || '#'} key={notification.id} className={`p-4 border-b hover:bg-gray-50 block ${!notification.read ? 'bg-teal-50' : ''}`}>
                        <div className="flex items-start gap-3">
                            <div className="mt-1">{getIcon(notification.type)}</div>
                            <div>
                                <p className="text-sm text-gray-700">{notification.text}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {notification.createdAt ? formatDistanceToNow(notification.createdAt.toDate(), { addSuffix: true }) : ''}
                                </p>
                            </div>
                        </div>
                    </Link>
                )) : <p className="p-4 text-sm text-gray-500 text-center">No new notifications.</p>}
            </div>
             <div className="p-2 text-center bg-gray-50 rounded-b-lg">
                <Link to="#" className="text-sm font-medium text-teal-600 hover:underline">View all notifications</Link>
            </div>
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
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  useEffect(() => {
      if (!currentUser) return;
      
      const q = query(
          collection(db, 'notifications'), 
          where('userId', '==', currentUser.uid), 
          orderBy('createdAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
          const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setNotifications(notifs);
      });

      return () => unsubscribe();
  }, [currentUser]);

  const unreadCount = notifications.filter(n => !n.read).length;

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
                {notificationsOpen && <NotificationPanel notifications={notifications} onClose={() => setNotificationsOpen(false)} />}
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
