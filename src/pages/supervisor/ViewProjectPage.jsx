
import React, { useState, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import SupervisorLayout from '../../components/SupervisorLayout';
import { FiFileText, FiUser, FiCheckCircle, FiClock, FiEye, FiLock, FiDownload, FiX, FiAward, FiCalendar } from 'react-icons/fi';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- Mock Data with Deadlines ---
const initialProjectData = {
  id: 'proj_01',
  title: 'Advanced Cryptography Techniques',
  studentName: 'Ethan Hunt',
  chapters: [
    { id: 1, title: 'Chapter 1: Introduction', status: 'approved', content: '<h1>Chapter 1: Introduction</h1><p>This is the content for the first chapter, detailing the project\'s scope and objectives.</p>', deadline: null },
    { id: 2, title: 'Chapter 2: Symmetric-Key Algorithms', status: 'approved', content: '<h1>Chapter 2: Symmetric-Key Algorithms</h1><p>Here we explore various symmetric-key algorithms.</p>', deadline: null },
    { id: 3, title: 'Chapter 3: Asymmetric-Key Algorithms', status: 'reviewing', content: '<h1>Chapter 3: Asymmetric-Key Algorithms</h1><p>This chapter focuses on public-key cryptography.</p>', deadline: '2025-07-15' },
    { id: 4, title: 'Chapter 4: Post-Quantum Cryptography', status: 'pending', content: '<h1>Chapter 4: Post-Quantum Cryptography</h1><p>Content for this chapter is pending submission.</p>', deadline: null },
    { id: 5, title: 'Chapter 5: Conclusion', status: 'pending', content: '<h1>Chapter 5: Conclusion</h1><p>The final summary of the project.</p>', deadline: null },
  ],
};

// --- Modals (SuccessNotification, SetDeadline, ProjectPreview) remain the same ---
const SuccessNotificationModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-30 backdrop-blur-md z-50 flex justify-center items-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md text-center" onClick={(e) => e.stopPropagation()}>
        <FiCheckCircle className="mx-auto text-green-500 mb-4" size={48} />
        <h3 className="text-2xl font-bold text-gray-900">Success!</h3>
        <p className="mt-3 text-gray-600">{message}</p>
        <div className="mt-8">
          <button onClick={onClose} className="bg-teal-600 text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-teal-700 transition-colors">OK</button>
        </div>
      </div>
    </div>
  )
};

const SetDeadlineModal = ({ isOpen, onClose, onSetDeadline, chapterTitle }) => {
  if (!isOpen) return null;
  const handleSubmit = (e) => {
    e.preventDefault();
    const deadline = e.target.elements.deadline.value;
    if (deadline) onSetDeadline(deadline);
  };
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-30 backdrop-blur-md z-50 flex justify-center items-center p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Set Next Deadline</h3>
        <p className="text-gray-600 mb-6">You've approved "{chapterTitle}". Please set the submission deadline for the next chapter.</p>
        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">Next Chapter Deadline</label>
          <div className="relative">
            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="date" id="deadline" name="deadline" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" required />
          </div>
        </div>
        <div className="mt-8 flex justify-end gap-4">
          <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300">Cancel</button>
          <button type="submit" className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700">Set Deadline</button>
        </div>
      </form>
    </div>
  );
};

const ProjectPreviewModal = ({ isOpen, onClose, project }) => {
  const printRef = useRef();
  const handleDownloadPDF = async () => {
    const element = printRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const data = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProperties = pdf.getImageProperties(data);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;
    pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${project.title.replace(/ /g, '_')}.pdf`);
  };

  if (!isOpen) return null;
  const fullProjectContent = project.chapters.map(c => c.content).join('<div style="page-break-after: always;"></div>');

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-30 backdrop-blur-md z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
        <header className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Project Preview: {project.title}</h2>
          <div className="flex items-center gap-4">
            <button onClick={handleDownloadPDF} className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-teal-700"><FiDownload />Download as PDF</button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><FiX size={24} /></button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-8" ref={printRef}>
          <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: fullProjectContent }} />
        </main>
      </div>
    </div>
  );
};


// --- Chapter List Item with Deadline Display ---
const ChapterListItem = ({ chapter, projectId }) => {
  let statusIcon, statusColor, statusBgColor;
  switch (chapter.status) {
    case 'approved': statusIcon = <FiCheckCircle className="text-green-500" />; statusColor = 'text-green-700'; statusBgColor = 'bg-green-100'; break;
    case 'reviewing': statusIcon = <FiClock className="text-yellow-500" />; statusColor = 'text-yellow-700'; statusBgColor = 'bg-yellow-100'; break;
    default: statusIcon = <FiLock className="text-gray-400" />; statusColor = 'text-gray-500'; statusBgColor = 'bg-gray-100';
  }

  return (
    <div className={`p-4 rounded-lg flex items-center justify-between transition-colors ${chapter.status !== 'pending' ? 'hover:bg-gray-50' : ''}`}>
      <div className="flex items-center gap-4">
        {statusIcon}
        <div>
          <p className={`font-semibold ${chapter.status === 'pending' ? 'text-gray-500' : 'text-gray-800'}`}>{chapter.title}</p>
          <p className={`text-sm font-medium px-2 py-0.5 inline-block rounded-full mt-1 ${statusColor} ${statusBgColor}`}>{chapter.status}</p>
          {chapter.status === 'reviewing' && chapter.deadline && (
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
              <FiCalendar size={12} />
              Deadline: {new Date(chapter.deadline).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
      {chapter.status !== 'pending' && (
        <Link to={`/supervisor/project/${projectId}/chapter/${chapter.id}`} className="text-teal-600 hover:text-teal-800" title="View Chapter"><FiEye size={20} /></Link>
      )}
    </div>
  )
};


const ViewProjectPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(initialProjectData);
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [notification, setNotification] = useState({ isOpen: false, message: '' });

  const activeChapter = useMemo(() => project.chapters.find(c => c.status === 'reviewing'), [project.chapters]);
  const isProjectComplete = useMemo(() => project.chapters.every(c => c.status === 'approved'), [project.chapters]);

  const showNotification = (message) => {
    setNotification({ isOpen: true, message });
  };

  const handleOpenDeadlineModal = () => {
    if (activeChapter) setIsDeadlineModalOpen(true);
  };

  const handleSetDeadline = (deadline) => {
    const currentChapterIndex = project.chapters.findIndex(c => c.id === activeChapter.id);
    const updatedChapters = [...project.chapters];

    updatedChapters[currentChapterIndex].status = 'approved';
    if (currentChapterIndex + 1 < updatedChapters.length) {
      updatedChapters[currentChapterIndex + 1].status = 'reviewing';
      // Set the deadline on the next chapter object
      updatedChapters[currentChapterIndex + 1].deadline = deadline;
    }

    setProject(prev => ({ ...prev, chapters: updatedChapters }));
    setIsDeadlineModalOpen(false);
    showNotification('Chapter marked as complete and a deadline for the next chapter has been set!');
  };

  return (
    <SupervisorLayout>
      <SuccessNotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ isOpen: false, message: '' })}
        message={notification.message}
      />
      <ProjectPreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} project={project} />
      {activeChapter && (
        <SetDeadlineModal
          isOpen={isDeadlineModalOpen}
          onClose={() => setIsDeadlineModalOpen(false)}
          onSetDeadline={handleSetDeadline}
          chapterTitle={activeChapter.title}
        />
      )}

      <div className="mb-8">
        <p className="text-gray-500 text-lg">Project Details</p>
        <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
        <div className="flex items-center text-gray-600 mt-1"><FiUser className="mr-2" /><span>Student:</span><span className="ml-2">{project.studentName}</span></div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4">
          <h2 className="text-xl font-bold text-gray-800">Chapter Progress</h2>
          {activeChapter && (
            <button
              onClick={handleOpenDeadlineModal}
              className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
            >
              <FiCheckCircle size={20} />
              Mark "{activeChapter.title}" as Complete
            </button>
          )}
          {isProjectComplete && (
            <div className="mt-4 md:mt-0 text-center">
              <p className="text-green-600 font-bold flex items-center gap-2"><FiAward />Project Completed!</p>
              <button
                onClick={() => setIsPreviewOpen(true)}
                className="mt-2 inline-flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Generate Full Project
              </button>
            </div>
          )}
        </div>
        <div className="space-y-4">
          {project.chapters.map(chapter => (
            <ChapterListItem key={chapter.id} chapter={chapter} projectId={project.id} />
          ))}
        </div>
      </div>
    </SupervisorLayout>
  );
};

export default ViewProjectPage;
