
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SupervisorLayout from '../../components/SupervisorLayout';
import { FiSearch, FiFileText, FiUser, FiMoreVertical, FiLoader, FiInbox } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import {
  db,
  collection,
  query,
  where,
  onSnapshot,
  orderBy
} from '../../firebase/config';

const ProjectCard = ({ project }) => {
  // A simple progress calculation for display purposes
  const progressPercentage = project.status === 'approved' ? 50 : project.status === 'pending' ? 10 : 0;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md flex flex-col justify-between hover:shadow-lg transition-shadow">
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-800">{project.title}</h3>
          <button className="text-gray-400 hover:text-gray-600">
            <FiMoreVertical size={20} />
          </button>
        </div>
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <FiUser className="mr-2" />
          <span>{project.studentName}</span>
        </div>
        <p className={`text-sm font-medium px-2 py-0.5 inline-block rounded-full mt-1 
                    ${project.status === 'approved' ? 'bg-green-100 text-green-700' :
            project.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'}`}
        >
          Status: {project.status}
        </p>
      </div>
      <div className="mt-6">
        <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
          <span>Progress</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className="bg-teal-600 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
        </div>
        <Link to={`/supervisor/project/${project.id}`} className="block w-full text-center mt-6 bg-teal-100 text-teal-800 px-5 py-2 rounded-lg font-semibold hover:bg-teal-200 transition-colors">
          View Project
        </Link>
      </div>
    </div>
  );
};


const AllProjectsPage = () => {
  const { currentUser } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const projectsQuery = query(
      collection(db, "projects"),
      where("supervisorId", "==", currentUser.uid),
      orderBy("dateSubmitted", "desc")
    );

    const unsubscribe = onSnapshot(projectsQuery, (snapshot) => {
      const fetchedProjects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProjects(fetchedProjects);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const filteredProjects = useMemo(() =>
    projects.filter(p =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.studentName && p.studentName.toLowerCase().includes(searchTerm.toLowerCase()))
    ), [projects, searchTerm]);

  return (
    <SupervisorLayout>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Projects</h1>
        <div className="relative mt-4 md:mt-0">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by title or student..."
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16"><FiLoader className="animate-spin mx-auto text-teal-500" size={48} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.length > 0 ? (
            filteredProjects.map(project => <ProjectCard key={project.id} project={project} />)
          ) : (
            <div className="col-span-full text-center py-16 bg-white rounded-xl shadow-md">
              <FiInbox size={60} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700">No Projects Found</h3>
              <p className="text-gray-500 mt-2">You are not currently supervising any projects.</p>
            </div>
          )}
        </div>
      )}
    </SupervisorLayout>
  );
};

export default AllProjectsPage;
