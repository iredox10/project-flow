
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import StudentLayout from '../../components/StudentLayout';
import { FiFileText, FiUser, FiClock, FiLoader, FiInbox, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { db, collection, query, where, onSnapshot, doc, getDoc, orderBy } from '../../firebase/config';
import { limit } from 'firebase/firestore';
import { format, formatDistanceToNow } from 'date-fns';


// --- Reusable Stat Card Component ---
const StatCard = ({ icon, title, value, color, loading }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        <div className={`p-4 rounded-full mr-4 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            {loading ? <FiLoader className="animate-spin mt-2 text-gray-400" /> : <p className="text-2xl font-bold text-gray-900">{value}</p>}
        </div>
    </div>
);

// --- Main Dashboard Component ---
const StudentDashboard = () => {
  const { currentUser } = useAuth();
  const [project, setProject] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [supervisor, setSupervisor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  // Fetch the student's active project
  useEffect(() => {
    if (!currentUser) {
        setLoading(false);
        return;
    }
    
    const projectQuery = query(
        collection(db, "projects"), 
        where("studentId", "==", currentUser.uid),
        where("status", "==", "approved")
    );

    const unsubscribeProject = onSnapshot(projectQuery, (snapshot) => {
        if (!snapshot.empty) {
            const projectData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
            setProject(projectData);
        } else {
            setProject(null); // No active project found
            setLoading(false);
        }
    });

    return () => unsubscribeProject();
  }, [currentUser]);

  // Fetch chapters, supervisor info, and recent activity once the project is loaded
  useEffect(() => {
    if (!project) {
        if(currentUser) setLoading(false);
        return;
    };

    const chaptersQuery = query(
        collection(db, "chapters"), 
        where("projectId", "==", project.id), 
        orderBy("chapterNumber")
    );
    const unsubscribeChapters = onSnapshot(chaptersQuery, (snapshot) => {
        const chapterIds = snapshot.docs.map(doc => doc.id);
        setChapters(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch recent comments for these chapters
        if (chapterIds.length > 0) {
            const commentsQuery = query(
                collection(db, "comments"),
                where("chapterId", "in", chapterIds),
                orderBy("createdAt", "desc"),
                limit(5)
            );
            const unsubscribeComments = onSnapshot(commentsQuery, (commentsSnapshot) => {
                setRecentActivity(commentsSnapshot.docs.map(doc => doc.data()));
            });
            return () => unsubscribeComments();
        }
    });

    const fetchSupervisor = async () => {
        if (project.supervisorId) {
            const supervisorDoc = await getDoc(doc(db, "users", project.supervisorId));
            if (supervisorDoc.exists()) setSupervisor(supervisorDoc.data());
        }
    };
    
    fetchSupervisor();
    setLoading(false);

    return () => unsubscribeChapters();
  }, [project, currentUser]);

  const stats = useMemo(() => {
      const approvedCount = chapters.filter(c => c.status === 'approved').length;
      const nextChapter = chapters.sort((a,b) => a.chapterNumber - b.chapterNumber).find(c => c.status === 'reviewing');
      const progressPercentage = chapters.length > 0 ? Math.round((approvedCount / chapters.length) * 100) : 0;
      
      let formattedDeadline = 'Not set';
      // FIX: Safely handle both Firebase Timestamps and date strings
      if (nextChapter && nextChapter.deadline) {
          if (typeof nextChapter.deadline.toDate === 'function') {
              // It's a Firestore Timestamp
              formattedDeadline = format(nextChapter.deadline.toDate(), 'MMMM d, yyyy');
          } else {
              // It's a string or a JS Date object
              formattedDeadline = format(new Date(nextChapter.deadline), 'MMMM d, yyyy');
          }
      }

      return {
          chaptersSubmitted: `${approvedCount}/${chapters.length || '0'}`,
          supervisorName: supervisor?.name || 'N/A',
          nextChapterTitle: nextChapter?.title || 'All chapters complete!',
          nextDeadline: formattedDeadline,
          progressPercentage: progressPercentage
      }
  }, [chapters, supervisor]);

  if (loading) {
      return <StudentLayout><div className="text-center p-8"><FiLoader className="animate-spin mx-auto text-blue-500" size={48} /></div></StudentLayout>;
  }

  return (
    <StudentLayout>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Welcome, {currentUser?.name}!</h1>
      
      {!project ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
              <FiInbox size={60} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700">No Active Project</h3>
              <p className="text-gray-500 mt-2">You do not have an approved project yet. Check the proposal page for updates.</p>
              <Link to="/student/proposal" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700">Go to Proposals</Link>
          </div>
      ) : (
        <>
            

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard icon={<FiFileText size={24} className="text-blue-500"/>} title="Chapters Complete" value={stats.chaptersSubmitted} color="bg-blue-100" loading={loading} />
                <StatCard icon={<FiUser size={24} className="text-green-500"/>} title="Supervisor" value={stats.supervisorName} color="bg-green-100" loading={loading} />
                <StatCard icon={<FiClock size={24} className="text-yellow-500"/>} title="Next Deadline" value={stats.nextDeadline} color="bg-yellow-100" loading={loading} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">What's Next?</h2>
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="font-semibold text-gray-700">Focus on Your Next Chapter</p>
                        <p className="text-lg font-bold text-blue-800 my-1">{stats.nextChapterTitle}</p>
                        <Link to="/student/my-project" className="inline-block mt-3 bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-blue-700">Go to Project</Link>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
                    {recentActivity.length > 0 ? (
                        <div className="space-y-4">
                            {recentActivity.map((activity, index) => {
                                const chapter = chapters.find(c => c.id === activity.chapterId);
                                return (
                                    <div key={index} className="flex items-start">
                                        <div className="bg-gray-100 p-2 rounded-full mr-3 mt-1">
                                            <FiFileText className="text-gray-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-800">
                                                <span className="font-semibold">{activity.authorName}</span> commented on {' '}
                                                <Link to={`/student/my-project/chapter/${activity.chapterId}`} className="text-blue-600 hover:underline font-semibold">
                                                    {chapter?.title || 'a chapter'}
                                                </Link>
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {activity.createdAt?.toDate ? formatDistanceToNow(activity.createdAt.toDate(), { addSuffix: true }) : ''}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 py-8">
                            No recent activity to show.
                        </div>
                    )}
                </div>
            </div>
            
        </>
      )}
    </StudentLayout>
  );
};

export default StudentDashboard;
