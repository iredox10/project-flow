
import React, { useState, useEffect, useMemo } from 'react';
import StudentLayout from '../../components/StudentLayout';
import { FiFileText, FiUser, FiCheckCircle, FiClock, FiEdit, FiCalendar, FiLoader, FiInbox } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  db,
  collection,
  query,
  where,
  onSnapshot,
  orderBy
} from '../../firebase/config';
import { format } from 'date-fns'; // Import the format function

const MyProjectPage = () => {
  const { currentUser } = useAuth();
  const [project, setProject] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [supervisor, setSupervisor] = useState(null);
  const [loading, setLoading] = useState(true);

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

  // Fetch chapters and supervisor info once the project is loaded
  useEffect(() => {
    if (!project) return;

    // Fetch chapters for the project
    const chaptersQuery = query(
      collection(db, "chapters"),
      where("projectId", "==", project.id),
      orderBy("chapterNumber")
    );
    const unsubscribeChapters = onSnapshot(chaptersQuery, (snapshot) => {
      const fetchedChapters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChapters(fetchedChapters);
    });

    // Fetch supervisor details
    const supervisorQuery = query(collection(db, "users"), where("uid", "==", project.supervisorId));
    const unsubscribeSupervisor = onSnapshot(supervisorQuery, (snapshot) => {
      if (!snapshot.empty) {
        setSupervisor(snapshot.docs[0].data());
      }
    });

    setLoading(false);

    return () => {
      unsubscribeChapters();
      unsubscribeSupervisor();
    };
  }, [project]);

  const progressPercentage = useMemo(() => {
    if (chapters.length === 0) return 0;
    const approvedCount = chapters.filter(c => c.status === 'approved').length;
    return (approvedCount / chapters.length) * 100;
  }, [chapters]);

  const activeChapter = useMemo(() => chapters.find(c => c.status === 'reviewing'), [chapters]);

  // Safely format the deadline date
  const formattedDeadline = useMemo(() => {
    if (!activeChapter?.deadline) return null;

    // Check if it's a Firebase Timestamp object
    if (typeof activeChapter.deadline.toDate === 'function') {
      return format(activeChapter.deadline.toDate(), 'MMMM d, yyyy');
    }
    // Otherwise, treat it as a string or Date object
    return format(new Date(activeChapter.deadline), 'MMMM d, yyyy');
  }, [activeChapter]);


  if (loading) {
    return <StudentLayout><div className="text-center p-8"><FiLoader className="animate-spin mx-auto" size={48} /></div></StudentLayout>;
  }

  if (!project) {
    return (
      <StudentLayout>
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <FiInbox size={60} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700">No Active Project</h3>
          <p className="text-gray-500 mt-2">You do not have an approved project yet. Please check the proposal page.</p>
          <Link to="/student/proposal" className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700">Go to Proposals</Link>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
        <div className="flex items-center text-gray-600 mt-1">
          <FiUser className="mr-2" />
          <span className="font-semibold">Supervisor:</span>
          <span className="ml-2">{supervisor?.name || 'Loading...'}</span>
        </div>
      </div>

      {/* Main Project Card */}
      <div className="bg-white p-8 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Project Progress</h2>
          {formattedDeadline && (
            <div className="mt-4 md:mt-0 p-3 bg-yellow-100 border border-yellow-200 rounded-lg flex items-center gap-3">
              <FiCalendar className="text-yellow-600" size={20} />
              <div>
                <p className="font-semibold text-yellow-800">Next Deadline</p>
                <p className="text-sm text-yellow-700">{formattedDeadline}</p>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          <p className="text-right text-sm text-gray-500 mt-1">{Math.round(progressPercentage)}% Complete</p>
        </div>

        {/* Chapters List */}
        <div className="space-y-4">
          {chapters.map(chapter => {
            const isApproved = chapter.status === 'approved';
            const isReviewing = chapter.status === 'reviewing';
            const isPending = chapter.status === 'pending';

            let statusIcon, statusBgColor, statusTextColor;
            if (isApproved) {
              statusIcon = <FiCheckCircle className="text-green-500" />;
              statusBgColor = 'bg-green-100';
              statusTextColor = 'text-green-700';
            } else if (isReviewing) {
              statusIcon = <FiClock className="text-yellow-500" />;
              statusBgColor = 'bg-yellow-100';
              statusTextColor = 'text-yellow-700';
            } else {
              statusIcon = <FiFileText className="text-gray-400" />;
              statusBgColor = 'bg-gray-100';
              statusTextColor = 'text-gray-600';
            }

            return (
              <div key={chapter.id} className="p-4 border rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                  {statusIcon}
                  <div>
                    <p className={`font-semibold ${isPending ? 'text-gray-500' : 'text-gray-800'}`}>{chapter.title}</p>
                    <p className={`text-xs font-medium px-2 py-0.5 inline-block rounded-full mt-1 ${statusTextColor} ${statusBgColor}`}>{chapter.status}</p>
                  </div>
                </div>
                <div>
                  {isReviewing && (
                    <Link
                      to={`/student/project/${project.id}/chapter/${chapter.id}`}
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                    >
                      <FiEdit size={16} />
                      View & Edit Chapter
                    </Link>
                  )}
                  {isApproved && <span className="text-sm font-medium text-green-600">Completed</span>}
                  {isPending && <span className="text-sm text-gray-500">Not Started</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </StudentLayout>
  );
};

export default MyProjectPage;
