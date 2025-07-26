
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiGrid, FiFilePlus, FiBook, FiUser, FiLogOut, FiBookOpen, FiBell, FiCheckCircle, FiMessageSquare } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { db, collection, query, where, onSnapshot, orderBy, writeBatch, doc, getDocs } from '../firebase/config';
import { formatDistanceToNow } from 'date-fns';

// --- Reusable Notification Panel Component ---
const NotificationPanel = ({ notifications, onClose, onMarkAllAsRead }) => {
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
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">Notifications</h3>
        {unreadCount > 0 && <span className="text-xs font-bold text-white bg-red-500 rounded-full px-2 py-0.5">{unreadCount} New</span>}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length > 0 ? notifications.map(notification => (
          <Link to={notification.link || '#'} key={notification.id} className={`p-4 border-b hover:bg-gray-50 block ${!notification.read ? 'bg-blue-50' : ''}`}>
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
        <Link to="#" onClick={onMarkAllAsRead} className="text-sm font-medium text-blue-600 hover:underline">View all notifications</Link>
      </div>
    </div>
  )
};


const SidebarLink = ({ to, icon, children, badgeCount }) => (
  <Link to={to} className="flex items-center justify-between px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors duration-200">
    <div className="flex items-center">
      {icon}
      <span className="ml-3 font-medium">{children}</span>
    </div>
    {badgeCount > 0 && (
      <span className="bg-blue-600 text-white text-xs font-semibold rounded-full px-2 py-0.5">
        {badgeCount}
      </span>
    )}
  </Link>
);

const StudentLayout = ({ children }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [badgeCounts, setBadgeCounts] = useState({ proposals: 0, projects: 0, messages: 0, announcements: 0 });
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

      // Calculate badge counts from unread notifications
      const unread = notifs.filter(n => !n.read);
      const announcementsQuery = query(
        collection(db, 'announcements'),
        where('readBy', 'not-in', [currentUser.uid])
      );
      const unsubscribeAnnouncements = onSnapshot(announcementsQuery, (announcementsSnapshot) => {
        const unreadAnnouncements = announcementsSnapshot.docs.length;
        setBadgeCounts({
          proposals: unread.filter(n => n.link?.includes('/proposal')).length,
          projects: unread.filter(n => n.link?.includes('/project')).length,
          messages: unread.filter(n => n.link?.includes('/messages')).length,
          announcements: unreadAnnouncements,
        });
      });

      return () => {
        unsubscribe();
        unsubscribeAnnouncements();
      };
    });

  }, [currentUser]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllAsRead = async () => {
    if (!currentUser) return;

    const batch = writeBatch(db);
    const q = query(collection(db, 'announcements'), where('readBy', 'not-in', [currentUser.uid]));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach(docSnap => {
      const docRef = doc(db, 'announcements', docSnap.id);
      const currentReadBy = docSnap.data().readBy || [];
      batch.update(docRef, { readBy: [...currentReadBy, currentUser.uid] });
    });

    await batch.commit();
    setNotificationsOpen(false); // Close panel after marking as read
  };

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
          <SidebarLink to="/student/proposal" icon={<FiFilePlus size={20} />} badgeCount={badgeCounts.proposals}>Project Proposal</SidebarLink>
          <SidebarLink to="/student/my-project" icon={<FiBook size={20} />} badgeCount={badgeCounts.projects}>My Project</SidebarLink>
          <SidebarLink to="/student/messages" icon={<FiMessageSquare size={20} />} badgeCount={badgeCounts.messages}>Messages</SidebarLink>
          <SidebarLink to="/student/announcements" icon={<FiBell size={20} />} badgeCount={badgeCounts.announcements}>Announcements</SidebarLink>
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
            {notificationsOpen && <NotificationPanel notifications={notifications} onClose={() => setNotificationsOpen(false)} onMarkAllAsRead={handleMarkAllAsRead} />}
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
