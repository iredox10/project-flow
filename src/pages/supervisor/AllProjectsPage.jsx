
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SupervisorLayout from '../../components/SupervisorLayout';
import { FiSearch, FiFileText, FiUser, FiMoreVertical } from 'react-icons/fi';

// --- Mock Data ---
// In a real app, this data would be fetched from your backend API
const mockProjects = [
  {
    id: 'proj_01',
    title: 'Advanced Cryptography Techniques',
    studentName: 'Ethan Hunt',
    chaptersSubmitted: 3,
    totalChapters: 5,
    lastActivity: 'Chapter 3 submitted - 2 days ago'
  },
  {
    id: 'proj_02',
    title: 'The Role of AI in Renewable Energy Grids',
    studentName: 'Alice Johnson',
    chaptersSubmitted: 1,
    totalChapters: 5,
    lastActivity: 'Chapter 1 feedback provided - 5 days ago'
  },
  {
    id: 'proj_03',
    title: 'A Study on Quantum Entanglement Applications',
    studentName: 'Charlie Brown',
    chaptersSubmitted: 5,
    totalChapters: 5,
    lastActivity: 'Project Completed - 1 week ago'
  },
];

const ProjectCard = ({ project }) => {
  const progressPercentage = (project.chaptersSubmitted / project.totalChapters) * 100;
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
        <p className="text-sm text-gray-600 mb-4">{project.lastActivity}</p>
      </div>
      <div>
        <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
          <span>Progress</span>
          <span>{project.chaptersSubmitted} / {project.totalChapters} Chapters</span>
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
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProjects = useMemo(() =>
    mockProjects.filter(p =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.studentName.toLowerCase().includes(searchTerm.toLowerCase())
    ), [searchTerm]);

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.length > 0 ? (
          filteredProjects.map(project => <ProjectCard key={project.id} project={project} />)
        ) : (
          <p className="text-gray-500 col-span-full text-center py-10">No projects match your search.</p>
        )}
      </div>
    </SupervisorLayout>
  );
};

export default AllProjectsPage;
