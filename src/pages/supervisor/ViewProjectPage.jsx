
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import SupervisorLayout from '../../components/SupervisorLayout';
import ConfirmationModal from '../../components/ConfirmationModal';
import NotificationModal from '../../components/NotificationModal';
import { FiFileText, FiUser, FiCheckCircle, FiClock, FiEye, FiLock, FiDownload, FiX, FiAward, FiCalendar, FiPlus, FiEdit, FiTrash2, FiSave, FiLoader, FiPlayCircle } from 'react-icons/fi';
import {
  db,
  doc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  addDoc,
  deleteDoc,
  orderBy
} from '../../firebase/config';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- Mock Data ---
const initialProjectData = {
  id: 'proj_01',
  title: 'Advanced Cryptography Techniques',
  studentName: 'Ethan Hunt',
};

// --- Set Deadline Modal ---
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
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Set Chapter Deadline</h3>
        <p className="text-gray-600 mb-6">You are activating "{chapterTitle}". Please set the submission deadline.</p>
        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">Submission Deadline</label>
          <div className="relative">
            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="date" id="deadline" name="deadline" className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500" required />
          </div>
        </div>
        <div className="mt-8 flex justify-end gap-4">
          <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300">Cancel</button>
          <button type="submit" className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700">Set Deadline & Activate</button>
        </div>
      </form>
    </div>
  );
};

// --- Project Preview Modal ---
const ProjectPreviewModal = ({ isOpen, onClose, project, chapters }) => {
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
  const fullProjectContent = chapters.sort((a, b) => a.chapterNumber - b.chapterNumber).map(c => c.content || '').join('<div style="page-break-after: always;"></div>');

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

// --- Add Chapter Modal ---
const AddChapterModal = ({ isOpen, onClose, onAdd, isAdding }) => {
  const [title, setTitle] = useState('');
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title) onAdd(title);
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-30 backdrop-blur-md z-50 flex justify-center items-center p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Add New Chapter</h3>
        <div>
          <label htmlFor="chapterTitle" className="block text-sm font-medium text-gray-700 mb-2">Chapter Title</label>
          <input type="text" id="chapterTitle" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500" required />
        </div>
        <div className="mt-8 flex justify-end gap-4">
          <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300">Cancel</button>
          <button type="submit" className="inline-flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700 w-32" disabled={isAdding}>
            {isAdding ? <FiLoader className="animate-spin" /> : <><FiPlus />Add</>}
          </button>
        </div>
      </form>
    </div>
  );
};

// --- Edit Chapter Modal ---
const EditChapterModal = ({ isOpen, onClose, onEdit, chapter, isEditing }) => {
  const [title, setTitle] = useState(chapter?.title || '');

  useEffect(() => {
    if (chapter) setTitle(chapter.title);
  }, [chapter]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title) onEdit(chapter.id, title);
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-30 backdrop-blur-md z-50 flex justify-center items-center p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Edit Chapter Title</h3>
        <div>
          <label htmlFor="editChapterTitle" className="block text-sm font-medium text-gray-700 mb-2">Chapter Title</label>
          <input type="text" id="editChapterTitle" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500" required />
        </div>
        <div className="mt-8 flex justify-end gap-4">
          <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300">Cancel</button>
          <button type="submit" className="inline-flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700 w-36" disabled={isEditing}>
            {isEditing ? <FiLoader className="animate-spin" /> : <><FiSave />Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  )
};

// --- Chapter List Item Component ---
const ChapterListItem = ({ chapter, projectId, onEditClick, onDeleteClick, onEnableClick, canEnable }) => {
  let statusIcon, statusColor, statusBgColor;
  switch (chapter.status) {
    case 'approved': statusIcon = <FiCheckCircle className="text-green-500" />; statusColor = 'text-green-700'; statusBgColor = 'bg-green-100'; break;
    case 'reviewing': statusIcon = <FiClock className="text-yellow-500" />; statusColor = 'text-yellow-700'; statusBgColor = 'bg-yellow-100'; break;
    default: statusIcon = <FiLock className="text-gray-400" />; statusColor = 'text-gray-500'; statusBgColor = 'bg-gray-100';
  }

  return (
    <div className="p-4 rounded-lg flex items-center justify-between transition-colors bg-gray-50 border">
      <div className="flex items-center gap-4">
        {statusIcon}
        <div>
          <p className="font-semibold text-gray-800">{chapter.title}</p>
          <p className={`text-sm font-medium px-2 py-0.5 inline-block rounded-full mt-1 ${statusColor} ${statusBgColor}`}>{chapter.status}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {chapter.status === 'pending' && (
          <button onClick={() => onEnableClick(chapter)} disabled={!canEnable} className="p-2 text-gray-500 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed" title={canEnable ? "Enable this chapter for student" : "Another chapter is already active"}>
            <FiPlayCircle size={18} />
          </button>
        )}
        {chapter.status !== 'pending' && (<Link to={`/supervisor/project/${projectId}/chapter/${chapter.id}`} className="p-2 text-gray-500 hover:text-teal-600" title="View Chapter"><FiEye size={18} /></Link>)}
        <button onClick={() => onEditClick(chapter)} className="p-2 text-gray-500 hover:text-blue-600" title="Edit Chapter"><FiEdit size={18} /></button>
        <button onClick={() => onDeleteClick(chapter)} className="p-2 text-gray-500 hover:text-red-600" title="Delete Chapter"><FiTrash2 size={18} /></button>
      </div>
    </div>
  )
};

// --- Main View Project Page Component ---
const ViewProjectPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(initialProjectData);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState({ add: false, edit: false, delete: false, deadline: false, preview: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [notification, setNotification] = useState({ isOpen: false, message: '' });

  useEffect(() => {
    const projectDocRef = doc(db, "projects", id);
    const unsubProject = onSnapshot(projectDocRef, (doc) => {
      if (doc.exists()) {
        setProject({ id: doc.id, ...doc.data() });
      }
    });

    const chaptersQuery = query(collection(db, "chapters"), where("projectId", "==", id), orderBy("chapterNumber"));
    const unsubChapters = onSnapshot(chaptersQuery, (snapshot) => {
      setChapters(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => {
      unsubProject();
      unsubChapters();
    };
  }, [id]);

  const showNotification = (message, type = 'success') => setNotification({ isOpen: true, message, title: type.charAt(0).toUpperCase() + type.slice(1), type });
  const closeModal = () => setModalState({ add: false, edit: false, delete: false, deadline: false, preview: false });

  const handleAddChapter = async (title) => {
    setIsSubmitting(true);
    const newChapterNumber = chapters.length > 0 ? Math.max(...chapters.map(c => c.chapterNumber)) + 1 : 1;
    await addDoc(collection(db, "chapters"), {
      projectId: id,
      title: title,
      chapterNumber: newChapterNumber,
      status: 'pending',
      content: `<h1>${title}</h1><p>Start writing here...</p>`,
      deadline: null,
    });
    showNotification(`Chapter "${title}" has been added successfully.`);
    setIsSubmitting(false);
    closeModal();
  };

  const handleEditChapter = async (chapterId, newTitle) => {
    setIsSubmitting(true);
    const chapterRef = doc(db, "chapters", chapterId);
    await updateDoc(chapterRef, { title: newTitle });
    showNotification(`Chapter has been renamed to "${newTitle}".`);
    setIsSubmitting(false);
    closeModal();
  };

  const handleDeleteChapter = async () => {
    if (!selectedChapter) return;
    setIsSubmitting(true);
    await deleteDoc(doc(db, "chapters", selectedChapter.id));
    showNotification(`Chapter "${selectedChapter.title}" has been deleted.`);
    setIsSubmitting(false);
    closeModal();
  };

  const activeChapter = useMemo(() => chapters.find(c => c.status === 'reviewing'), [chapters]);
  const isProjectComplete = useMemo(() => chapters.length > 0 && chapters.every(c => c.status === 'approved'), [chapters]);

  const handleMarkComplete = async () => {
    if (!activeChapter) return;
    const chapterRef = doc(db, "chapters", activeChapter.id);
    await updateDoc(chapterRef, { status: 'approved', deadline: null });
    showNotification(`Chapter "${activeChapter.title}" has been marked as complete.`);
  };

  const handleEnableChapter = (chapter) => {
    if (activeChapter) {
      showNotification('Action Not Allowed', `Please complete or revise the currently active chapter ("${activeChapter.title}") before enabling a new one.`, 'error');
      return;
    }
    setSelectedChapter(chapter);
    setModalState({ ...modalState, deadline: true });
  };

  const handleSetDeadline = async (deadline) => {
    if (!selectedChapter) return;
    const chapterRef = doc(db, "chapters", selectedChapter.id);
    await updateDoc(chapterRef, {
      status: 'reviewing',
      deadline: deadline
    });
    showNotification(`Chapter "${selectedChapter.title}" is now active and the deadline has been set.`);
    closeModal();
  };

  return (
    <SupervisorLayout>
      <NotificationModal isOpen={notification.isOpen} onClose={() => setNotification({ isOpen: false, message: '' })} title={notification.title} message={notification.message} type={notification.type} />
      <AddChapterModal isOpen={modalState.add} onClose={closeModal} onAdd={handleAddChapter} isAdding={isSubmitting} />
      <EditChapterModal isOpen={modalState.edit} onClose={closeModal} onEdit={handleEditChapter} chapter={selectedChapter} isEditing={isSubmitting} />
      <ConfirmationModal isOpen={modalState.delete} onClose={closeModal} onConfirm={handleDeleteChapter} title="Delete Chapter?" message={`Are you sure you want to delete the chapter "${selectedChapter?.title}"?`} />
      <ProjectPreviewModal isOpen={modalState.preview} onClose={closeModal} project={project} chapters={chapters} />
      {selectedChapter && (
        <SetDeadlineModal
          isOpen={modalState.deadline}
          onClose={closeModal}
          onSetDeadline={handleSetDeadline}
          chapterTitle={selectedChapter.title}
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
            <button onClick={handleMarkComplete} className="mt-4 md:mt-0 inline-flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-teal-700 transition-colors">
              <FiCheckCircle size={20} /> Mark "{activeChapter.title}" as Complete
            </button>
          )}
          {isProjectComplete && (
            <div className="mt-4 md:mt-0 text-center">
              <p className="text-green-600 font-bold flex items-center gap-2"><FiAward />Project Completed!</p>
              <button onClick={() => setModalState({ ...modalState, preview: true })} className="mt-2 inline-flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                Generate Full Project
              </button>
            </div>
          )}
        </div>
        {loading ? <div className="text-center p-8"><FiLoader className="animate-spin mx-auto" /></div> : (
          <div className="space-y-4">
            {chapters.sort((a, b) => a.chapterNumber - b.chapterNumber).map(chapter => (
              <ChapterListItem
                key={chapter.id}
                chapter={chapter}
                projectId={project.id}
                onEditClick={(c) => { setSelectedChapter(c); setModalState({ ...modalState, edit: true }); }}
                onDeleteClick={(c) => { setSelectedChapter(c); setModalState({ ...modalState, delete: true }); }}
                onEnableClick={handleEnableChapter}
                canEnable={!activeChapter}
              />
            ))}
          </div>
        )}
        <div className="mt-6 border-t pt-6 flex justify-center">
          <button onClick={() => setModalState({ ...modalState, add: true })} className="inline-flex items-center gap-2 text-teal-600 font-semibold hover:text-teal-800">
            <FiPlus /> Add New Chapter
          </button>
        </div>
      </div>
    </SupervisorLayout>
  );
};

export default ViewProjectPage;
