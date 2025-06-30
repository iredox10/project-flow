
import React, { useState, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import SupervisorLayout from '../../components/SupervisorLayout';
import { FiFileText, FiUser, FiCheckCircle, FiClock, FiEye, FiLock, FiDownload, FiX, FiAward } from 'react-icons/fi';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


// --- Mock Data ---
const initialProjectData = {
  id: 'proj_01',
  title: 'Advanced Cryptography Techniques',
  studentName: 'Ethan Hunt',
  chapters: [
    { id: 1, title: 'Chapter 1: Introduction', status: 'approved', content: '<h1>Chapter 1: Introduction</h1><p>This is the content for the first chapter, detailing the project\'s scope and objectives.</p>' },
    { id: 2, title: 'Chapter 2: Symmetric-Key Algorithms', status: 'approved', content: '<h1>Chapter 2: Symmetric-Key Algorithms</h1><p>Here we explore various symmetric-key algorithms.</p>' },
    { id: 3, title: 'Chapter 3: Asymmetric-Key Algorithms', status: 'reviewing', content: '<h1>Chapter 3: Asymmetric-Key Algorithms</h1><p>This chapter focuses on public-key cryptography.</p>' },
    { id: 4, title: 'Chapter 4: Post-Quantum Cryptography', status: 'pending', content: '<h1>Chapter 4: Post-Quantum Cryptography</h1><p>Content for this chapter is pending submission.</p>' },
    { id: 5, title: 'Chapter 5: Conclusion', status: 'pending', content: '<h1>Chapter 5: Conclusion</h1><p>The final summary of the project.</p>' },
  ],
};

// --- Project Preview Modal ---
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


const ChapterListItem = ({ chapter, projectId }) => {
  let statusIcon, statusColor, statusBgColor;
  switch (chapter.status) {
    case 'approved':
      statusIcon = <FiCheckCircle className="text-green-500" />;
      statusColor = 'text-green-700';
      statusBgColor = 'bg-green-100';
      break;
    case 'reviewing':
      statusIcon = <FiClock className="text-yellow-500" />;
      statusColor = 'text-yellow-700';
      statusBgColor = 'bg-yellow-100';
      break;
    default: // pending
      statusIcon = <FiLock className="text-gray-400" />;
      statusColor = 'text-gray-500';
      statusBgColor = 'bg-gray-100';
  }

  return (
    <div className={`p-4 rounded-lg flex items-center justify-between transition-colors ${chapter.status !== 'pending' ? 'hover:bg-gray-50' : ''}`}>
      <div className="flex items-center gap-4">
        {statusIcon}
        <div>
          <p className={`font-semibold ${chapter.status === 'pending' ? 'text-gray-500' : 'text-gray-800'}`}>{chapter.title}</p>
          <p className={`text-sm font-medium px-2 py-0.5 inline-block rounded-full mt-1 ${statusColor} ${statusBgColor}`}>{chapter.status}</p>
        </div>
      </div>
      {chapter.status !== 'pending' && (
        <Link to={`/supervisor/project/${projectId}/chapter/${chapter.id}`} className="text-teal-600 hover:text-teal-800" title="View Chapter">
          <FiEye size={20} />
        </Link>
      )}
    </div>
  )
};

const ViewProjectPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(initialProjectData);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleMarkComplete = () => {
    const currentChapterIndex = project.chapters.findIndex(c => c.status === 'reviewing');
    if (currentChapterIndex === -1) return;

    const updatedChapters = [...project.chapters];
    updatedChapters[currentChapterIndex].status = 'approved';

    if (currentChapterIndex + 1 < updatedChapters.length) {
      updatedChapters[currentChapterIndex + 1].status = 'reviewing';
    }

    setProject(prev => ({ ...prev, chapters: updatedChapters }));
  };

  const activeChapter = project.chapters.find(c => c.status === 'reviewing');
  const isProjectComplete = useMemo(() => project.chapters.every(c => c.status === 'approved'), [project.chapters]);

  return (
    <SupervisorLayout>
      <ProjectPreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} project={project} />

      <div className="mb-8">
        <p className="text-gray-500 text-lg">Project Details</p>
        <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
        <div className="flex items-center text-gray-600 mt-1"><FiUser className="mr-2" /><span className="font-semibold">Student:</span><span className="ml-2">{project.studentName}</span></div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4">
          <h2 className="text-xl font-bold text-gray-800">Chapter Progress</h2>
          {activeChapter && (
            <button
              onClick={handleMarkComplete}
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
