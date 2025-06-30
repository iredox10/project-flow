
import React, { useState, useMemo } from 'react';
import StudentLayout from '../../components/StudentLayout';
import { FiFileText, FiUser, FiCheckCircle, FiClock, FiEdit, FiCalendar } from 'react-icons/fi';
import { Link } from 'react-router-dom';

// --- Mock Data with Deadline ---
const mockProject = {
  id: 'proj_01',
  title: 'Advanced Cryptography Techniques',
  supervisor: 'Dr. Alan Turing',
  chapters: [
    { id: 1, title: 'Chapter 1: Introduction', status: 'approved', deadline: null },
    { id: 2, title: 'Chapter 2: Symmetric-Key Algorithms', status: 'approved', deadline: null },
    { id: 3, title: 'Chapter 3: Asymmetric-Key Algorithms', status: 'reviewing', deadline: '2025-07-15' },
    { id: 4, title: 'Chapter 4: Post-Quantum Cryptography', status: 'pending', deadline: null },
    { id: 5, title: 'Chapter 5: Conclusion', status: 'pending', deadline: null },
  ],
};

const MyProjectPage = () => {
  const [project] = useState(mockProject);

  const progressPercentage = (project.chapters.filter(c => c.status === 'approved').length / project.chapters.length) * 100;
  const activeChapter = useMemo(() => project.chapters.find(c => c.status === 'reviewing'), [project.chapters]);

  return (
    <StudentLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
        <div className="flex items-center text-gray-600 mt-1">
          <FiUser className="mr-2" />
          <span className="font-semibold">Supervisor:</span>
          <span className="ml-2">{project.supervisor}</span>
        </div>
      </div>

      {/* Main Project Card */}
      <div className="bg-white p-8 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Project Progress</h2>
          {activeChapter?.deadline && (
            <div className="mt-4 md:mt-0 p-3 bg-yellow-100 border border-yellow-200 rounded-lg flex items-center gap-3">
              <FiCalendar className="text-yellow-600" size={20} />
              <div>
                <p className="font-semibold text-yellow-800">Next Deadline</p>
                <p className="text-sm text-yellow-700">{new Date(activeChapter.deadline).toLocaleDateString()}</p>
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
          {project.chapters.map(chapter => {
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
