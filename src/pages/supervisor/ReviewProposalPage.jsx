
import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import SupervisorLayout from '../../components/SupervisorLayout';
import { FiCheckCircle, FiXCircle, FiUser, FiFileText, FiMessageSquare } from 'react-icons/fi';

// --- Mock Data ---
// In a real app, you would fetch this data from your API using the `id` from the URL
const mockProposals = [
  { id: 1, studentName: 'Ethan Hunt', projectTitle: 'Advanced Cryptography Techniques', description: 'This project aims to explore and implement modern cryptographic algorithms, focusing on post-quantum security challenges. It will involve a detailed literature review, implementation of a selected algorithm (e.g., SIKE), and a comparative analysis of its performance against traditional methods like RSA and ECC.' },
  { id: 2, studentName: 'Fiona Glenanne', projectTitle: 'Machine Learning for Anomaly Detection', description: 'The project will focus on developing an unsupervised machine learning model to detect anomalies in network traffic data. The primary goal is to identify potential security threats in real-time. The work will compare different models like Isolation Forest and Autoencoders.' },
];

// --- Confirmation Modal ---
const ActionModal = ({ isOpen, onClose, onConfirm, title, children, confirmText, confirmColor }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-30 backdrop-blur-md z-50 flex justify-center items-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
        <div className="text-gray-600">{children}</div>
        <div className="mt-8 flex justify-end gap-4">
          <button onClick={onClose} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300">Cancel</button>
          <button onClick={onConfirm} className={`text-white px-6 py-2 rounded-lg font-semibold ${confirmColor}`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};


const ReviewProposalPage = () => {
  const { id } = useParams();
  const [rejectionReason, setRejectionReason] = useState('');
  const [modalState, setModalState] = useState({ isOpen: false, action: null });

  const proposal = useMemo(() => mockProposals.find(p => p.id === parseInt(id)), [id]);

  const handleActionClick = (action) => {
    if (action === 'reject' && !rejectionReason.trim()) {
      alert('Please provide a reason for rejection.');
      return;
    }
    setModalState({ isOpen: true, action });
  };

  const handleConfirmAction = () => {
    if (modalState.action === 'approve') {
      // API call to approve the proposal
      alert(`Proposal "${proposal.projectTitle}" has been approved.`);
    } else if (modalState.action === 'reject') {
      // API call to reject the proposal with the reason
      alert(`Proposal "${proposal.projectTitle}" has been rejected. Reason: ${rejectionReason}`);
    }
    setModalState({ isOpen: false, action: null });
    // Navigate back to dashboard or update UI
  };

  if (!proposal) {
    return (
      <SupervisorLayout>
        <h1 className="text-2xl font-bold">Proposal not found.</h1>
        <Link to="/supervisor/dashboard" className="text-teal-600 hover:underline">Return to Dashboard</Link>
      </SupervisorLayout>
    );
  }

  return (
    <SupervisorLayout>
      <ActionModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, action: null })}
        onConfirm={handleConfirmAction}
        title={modalState.action === 'approve' ? 'Approve Proposal?' : 'Reject Proposal?'}
        confirmText={modalState.action === 'approve' ? 'Yes, Approve' : 'Yes, Reject'}
        confirmColor={modalState.action === 'approve' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-red-600 hover:bg-red-700'}
      >
        <p>Are you sure you want to {modalState.action} this project proposal? This action cannot be undone.</p>
      </ActionModal>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Review Project Proposal</h1>

      <div className="bg-white p-8 rounded-xl shadow-md space-y-6">
        {/* Proposal Header */}
        <div>
          <div className="flex items-center text-gray-600 mb-2">
            <FiUser className="mr-2" />
            <span className="font-semibold">Student:</span>
            <span className="ml-2">{proposal.studentName}</span>
          </div>
          <div className="flex items-start text-gray-800">
            <FiFileText className="mr-2 mt-1 flex-shrink-0" />
            <span className="font-semibold">Title:</span>
            <h2 className="text-2xl font-bold ml-2">{proposal.projectTitle}</h2>
          </div>
        </div>

        {/* Proposal Description */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-lg text-gray-800 mb-2">Project Description</h3>
          <p className="text-gray-600 leading-relaxed">{proposal.description}</p>
        </div>

        {/* Rejection Reason Form (Conditional) */}
        <div className="border-t pt-6">
          <h3 className="font-semibold text-lg text-gray-800 mb-2">Feedback / Reason for Rejection</h3>
          <div className="relative">
            <FiMessageSquare className="absolute left-3 top-4 text-gray-400" size={20} />
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows="5"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition"
              placeholder="If rejecting, please provide clear feedback for the student..."
            ></textarea>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 border-t pt-6">
          <button onClick={() => handleActionClick('reject')} className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-6 py-3 rounded-lg font-semibold hover:bg-red-200 transition-colors">
            <FiXCircle size={20} />
            Reject
          </button>
          <button onClick={() => handleActionClick('approve')} className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors">
            <FiCheckCircle size={20} />
            Approve
          </button>
        </div>
      </div>
    </SupervisorLayout>
  );
};

export default ReviewProposalPage;
