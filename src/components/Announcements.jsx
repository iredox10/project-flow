import React, { useState, useEffect } from 'react';
import { db, collection, query, where, orderBy, onSnapshot, getDocs } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const announcementsRef = collection(db, 'announcements');
    let announcementsQuery;

    const fetchAnnouncements = async () => {
      if (currentUser.role === 'student') {
        const projectsRef = collection(db, 'projects');
        const q = query(projectsRef, where('studentId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        const projects = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        
        if (projects.length > 0) {
          const supervisorId = projects[0].supervisorId;
          announcementsQuery = query(
            announcementsRef,
            where('authorId', 'in', ['all', supervisorId]),
            orderBy('createdAt', 'desc')
          );
        } else {
          // No project found, default to 'all' scope
          announcementsQuery = query(
            announcementsRef,
            where('scope', '==', 'all'),
            orderBy('createdAt', 'desc')
          );
        }
      } else if (currentUser.role === 'supervisor') {
        announcementsQuery = query(
          announcementsRef,
          where('authorId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
      } else {
        // Admin and Super Admin see all
        announcementsQuery = query(announcementsRef, orderBy('createdAt', 'desc'));
      }

      const unsubscribe = onSnapshot(announcementsQuery, (querySnapshot) => {
        const announcementsData = [];
        querySnapshot.forEach((doc) => {
          announcementsData.push({ ...doc.data(), id: doc.id });
        });
        setAnnouncements(announcementsData);
      });

      return unsubscribe;
    };

    const unsubscribePromise = fetchAnnouncements();

    return () => {
      unsubscribePromise.then(unsubscribe => unsubscribe && unsubscribe());
    };
  }, [currentUser]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Announcements</h2>
      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="border-b pb-4">
            <h3 className="text-xl font-semibold">{announcement.title}</h3>
            <p className="text-gray-700 mt-2">{announcement.content}</p>
            <div className="text-sm text-gray-500 mt-2">
              <span>By {announcement.author}</span> | <span>{announcement.createdAt ? format(announcement.createdAt.toDate(), 'PPP') : ''}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Announcements;
