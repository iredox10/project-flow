
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import SupervisorLayout from '../../components/SupervisorLayout';
import ConfirmationModal from '../../components/ConfirmationModal';
import NotificationModal from '../../components/NotificationModal'
import { FiCheckCircle, FiXCircle, FiUser, FiFileText, FiMessageSquare, FiCalendar, FiCheck, FiLoader } from 'react-icons/fi';
import {
  db,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from '../../firebase/config';

// --- Set Deadline Modal ---
const SetDeadlineModal = ({ isOpen, onClose, onSetDeadline, projectTitle }) => {
  if (!isOpen) return null;
  const handleSubmit = (e) => {
    e.preventDefault();
    const deadline = e.target.elements.deadline.value;
    if (deadline) onSetDeadline(deadline);
  };
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-30 backdrop-blur-md z-50 flex justify-center items-center p-4">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Set Project Deadline</h3>
        <p className="text-gray-600 mb-6">The proposal for "{projectTitle}" will be approved. Please set the final submission deadline.</p>
        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">Submission Deadline</label>
          <div className="relative">
            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="date" id="deadline" name="deadline" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" required />
          </div>
        </div>
        <div className="mt-8 flex justify-end gap-4">
          <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300">Cancel</button>
          <button type="submit" className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700">
            <FiCheckCircle /> Set Deadline & Approve
          </button>
        </div>
      </form>
    </div>
  );
};


const ReviewProposalPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [modalState, setModalState] = useState({ action: null, confirmOpen: false, deadlineOpen: false });
  const [notification, setNotification] = useState({ isOpen: false, title: '', message: '' });

  useEffect(() => {
    const fetchProposalData = async () => {
      setLoading(true);
      const proposalDocRef = doc(db, "projects", id);
      const proposalDoc = await getDoc(proposalDocRef);

      if (proposalDoc.exists()) {
        const proposalData = { id: proposalDoc.id, ...proposalDoc.data() };
        setProposal(proposalData);

        // Fetch student details
        const studentDocRef = doc(db, "users", proposalData.studentId);
        const studentDoc = await getDoc(studentDocRef);
        if (studentDoc.exists()) {
          setStudent(studentDoc.data());
        }
      } else {
        console.error("No such proposal!");
      }
      setLoading(false);
    };

    fetchProposalData();
  }, [id]);

  const showNotification = (title, message, type = 'success') => {
    setNotification({ isOpen: true, title, message, type });
  };

  const handleActionClick = (action) => {
    if (action === 'reject' && !rejectionReason.trim()) {
      showNotification('Error', 'Please provide a reason for rejection.', 'error');
      return;
    }
    setModalState({ ...modalState, action, confirmOpen: true });
  };

  const handleConfirmAction = () => {
    if (modalState.action === 'approve') {
      setModalState({ action: 'approve', confirmOpen: false, deadlineOpen: true });
    } else if (modalState.action === 'reject') {
      const proposalRef = doc(db, "projects", proposal.id);
      updateDoc(proposalRef, {
        status: 'rejected',
        supervisorComment: rejectionReason
      }).then(() => {
        showNotification('Success', `Proposal "${proposal.title}" has been rejected.`);
        navigate('/supervisor/proposals');
      });
      setModalState({ action: null, confirmOpen: false, deadlineOpen: false });
    }
  };

  const handleSetDeadline = async (deadline) => {
    const proposalRef = doc(db, "projects", proposal.id);
    await updateDoc(proposalRef, {
      status: 'approved',
      dateApproved: serverTimestamp(),
      finalDeadline: deadline
    });
    showNotification('Success', `Proposal "${proposal.title}" approved with a deadline of ${deadline}.`);
    setModalState({ action: null, confirmOpen: false, deadlineOpen: false });
    navigate('/supervisor/proposals');
  };

  if (loading) {
    return <SupervisorLayout><div className="text-center py-16"><FiLoader className="animate-spin mx-auto text-teal-500" size={48} /></div></SupervisorLayout>;
  }

  if (!proposal) {
    return <SupervisorLayout><h1 className="text-2xl font-bold">Proposal not found.</h1></SupervisorLayout>;
  }

  return (
    <SupervisorLayout>
      <NotificationModal isOpen={notification.isOpen} onClose={() => setNotification({ ...notification, isOpen: false })} title={notification.title} message={notification.message} type={notification.type} />
      <ConfirmationModal
        isOpen={modalState.confirmOpen}
        onClose={() => setModalState({ ...modalState, confirmOpen: false })}
        onConfirm={handleConfirmAction}
        title={modalState.action === 'approve' ? 'Approve Proposal?' : 'Reject Proposal?'}
        confirmText={modalState.action === 'approve' ? 'Yes, Approve' : 'Yes, Reject'}
        confirmColor={modalState.action === 'approve' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-red-600 hover:bg-red-700'}
      ><p>Are you sure you want to {modalState.action} this project proposal?</p></ConfirmationModal>

      <SetDeadlineModal
        isOpen={modalState.deadlineOpen}
        onClose={() => setModalState({ ...modalState, deadlineOpen: false })}
        onSetDeadline={handleSetDeadline}
        projectTitle={proposal.title}
      />

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Review Project Proposal</h1>

      <div className="bg-white p-8 rounded-xl shadow-md space-y-6">
        <div>
          <div className="flex items-center text-gray-600 mb-2"><FiUser className="mr-2" /><span>Student:</span><span className="ml-2 font-semibold">{student?.name || 'Loading...'}</span></div>
          <div className="flex items-start text-gray-800"><FiFileText className="mr-2 mt-1 flex-shrink-0" /><h2 className="text-2xl font-bold ml-2">{proposal.title}</h2></div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold text-lg text-gray-800 mb-2">Project Description</h3>
          <p className="text-gray-600 leading-relaxed">{proposal.description}</p>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold text-lg text-gray-800 mb-2">Feedback / Reason for Rejection</h3>
          <div className="relative">
            <FiMessageSquare className="absolute left-3 top-4 text-gray-400" size={20} />
            <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows="5" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition" placeholder="If rejecting, please provide clear feedback for the student..."></textarea>
          </div>
        </div>

        <div className="flex justify-end gap-4 border-t pt-6">
          <button onClick={() => handleActionClick('reject')} className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-6 py-3 rounded-lg font-semibold hover:bg-red-200 transition-colors">
            <FiXCircle size={20} /> Reject
          </button>
          <button onClick={() => handleActionClick('approve')} className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors">
            <FiCheckCircle size={20} /> Approve
          </button>
        </div>
      </div>
    </SupervisorLayout>
  );
};

export default ReviewProposalPage;
