
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import SupervisorLayout from '../../components/SupervisorLayout';
import { FiFileText, FiUser, FiCheckCircle, FiClock, FiPaperclip } from 'react-icons/fi';

// --- Mock Data ---
const mockProjectData = {
  id: 'proj_01',
  title: 'Advanced Cryptography Techniques',
  studentName: 'Ethan Hunt',
  chapters: [
    { id: 1, title: 'Chapter 1: Introduction to Cryptography', status: 'approved', content: '<h1>Chapter 1: An Introduction</h1><p>This chapter provides a foundational overview of cryptographic principles, tracing its origins from ancient ciphers to modern digital encryption. We will explore the core concepts of confidentiality, integrity, and availability.</p>', feedback: 'Excellent introduction. The historical context is well-researched. Approved.' },
    { id: 2, title: 'Chapter 2: Symmetric-Key Algorithms', status: 'approved', content: '<h1>Symmetric-Key Algorithms</h1><p>Exploring algorithms like AES and DES, this chapter details the mechanics of symmetric encryption where the same key is used for both encryption and decryption.</p>', feedback: 'Good work. Move on to the next chapter.' },
    { id: 3, title: 'Chapter 3: Asymmetric-Key Algorithms', status: 'reviewing', content: '<h1>Asymmetric-Key Algorithms</h1><p>This section covers RSA, ECC, and their mathematical underpinnings. The focus will be on how public-key cryptography solves the key distribution problem.</p>', feedback: null },
    { id: 4, title: 'Chapter 4: Post-Quantum Cryptography', status: 'pending', content: null, feedback: null },
    { id: 5, title: 'Chapter 5: Conclusion', status: 'pending', content: null, feedback: null },
  ],
};

const ChapterListItem = ({ chapter, projectId, onSelect, isActive }) => {
  let statusIcon, statusColor;
  switch (chapter.status) {
    case 'approved': statusIcon = <FiCheckCircle className="text-green-500" />; statusColor = 'text-green-600'; break;
    case 'reviewing': statusIcon = <FiClock className="text-yellow-500" />; statusColor = 'text-yellow-600'; break;
    default: statusIcon = <FiFileText className="text-gray-400" />; statusColor = 'text-gray-500';
  }

  // Only submitted chapters can be opened in the editor
  if (chapter.content) {
    return (
      <Link to={`/supervisor/project/${projectId}/chapter/${chapter.id}`} className={`w-full text-left p-4 rounded-lg flex items-center gap-4 transition-colors ${isActive ? 'bg-teal-100' : 'hover:bg-gray-100'}`} onClick={() => onSelect(chapter)}>
        {statusIcon}
        <div>
          <p className={`font-semibold ${isActive ? 'text-teal-800' : 'text-gray-800'}`}>{chapter.title}</p>
          <p className={`text-sm ${isActive ? 'text-teal-700' : statusColor}`}>{chapter.status.charAt(0).toUpperCase() + chapter.status.slice(1)}</p>
        </div>
      </Link>
    )
  }

  // Render a non-clickable item for pending chapters
  return (
    <div className="w-full text-left p-4 rounded-lg flex items-center gap-4 bg-gray-50 opacity-60 cursor-not-allowed">
      {statusIcon}
      <div>
        <p className="font-semibold text-gray-800">{chapter.title}</p>
        <p className="text-sm text-gray-500">{chapter.status.charAt(0).toUpperCase() + chapter.status.slice(1)}</p>
      </div>
    </div>
  )
};


const ViewProjectPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(mockProjectData);
  const [selectedChapter, setSelectedChapter] = useState(project.chapters.find(c => c.status === 'reviewing') || project.chapters[0]);

  if (!project) return <SupervisorLayout><p>Project not found.</p></SupervisorLayout>;

  return (
    <SupervisorLayout>
      <div className="mb-8">
        <p className="text-gray-500 text-lg">Project Details</p>
        <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
        <div className="flex items-center text-gray-600 mt-1"><FiUser className="mr-2" /><span className="font-semibold">Student:</span><span className="ml-2">{project.studentName}</span></div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/3">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Chapters</h2>
            <div className="space-y-2">
              {project.chapters.map(chapter => (
                <ChapterListItem key={chapter.id} chapter={chapter} projectId={project.id} onSelect={setSelectedChapter} isActive={selectedChapter.id === chapter.id} />
              ))}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-2/3">
          <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">{selectedChapter.title}</h2>
            {selectedChapter.feedback && (
              <div className="prose max-w-none text-gray-700 mb-6 p-4 bg-teal-50 rounded-lg">
                <h3 className="font-semibold">Your Last Feedback:</h3>
                <p>"{selectedChapter.feedback}"</p>
              </div>
            )}
            <div className="text-center py-12">
              <p className="text-gray-500">Select a submitted chapter from the list or click to open the editor and add feedback.</p>
              <Link to={`/supervisor/project/${project.id}/chapter/${selectedChapter.id}`} className="mt-4 inline-block bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700 transition-colors">
                Open Editor
              </Link>
            </div>
          </div>
        </div>
      </div>
    </SupervisorLayout>
  );
};

export default ViewProjectPage;
