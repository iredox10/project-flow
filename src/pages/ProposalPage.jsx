
import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { FiFileText, FiUser, FiCheck, FiClock, FiXCircle, FiMessageSquare, FiSend, FiCheckCircle } from 'react-icons/fi';

// --- Reusable Modal Component ---
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    // Backdrop with a lighter, more pronounced blur effect
    <div
      className="fixed inset-0 bg-gray-500 bg-opacity-30 backdrop-blur-md z-50 flex justify-center items-center p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      {/* Modal Content */}
      <div
        className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-95 hover:scale-100"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <div className="text-center">
          <FiCheckCircle className="mx-auto text-green-500 mb-4" size={48} />
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          <div className="mt-3 text-gray-600">
            {children}
          </div>
        </div>
        <div className="mt-8 flex justify-center">
          <button
            onClick={onClose}
            className="bg-indigo-600 text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};


// --- Mock Data ---
const mockProposals = [
  {
    id: 1,
    title: 'An Analysis of Reinforcement Learning in Game AI',
    status: 'rejected',
    supervisorComment: 'This topic is a bit too broad. Can you narrow it down to a specific game or learning algorithm? Also, please provide more background on the existing literature.',
    studentReply: null,
  },
  {
    id: 2,
    title: 'The Future of Quantum Computing',
    status: 'pending',
    supervisorComment: null,
    studentReply: null,
  }
];

const supervisors = [
  { id: 1, name: 'Dr. Ada Lovelace' },
  { id: 2, name: 'Dr. Alan Turing' },
  { id: 3, name: 'Dr. Grace Hopper' },
];

// --- Sub-component for a single proposal card ---
const ProposalCard = ({ proposal, showModal }) => {
  const [reply, setReply] = useState('');
  const isRejected = proposal.status === 'rejected';
  const isPending = proposal.status === 'pending';

  const handleReplySubmit = (e) => {
    e.preventDefault();
    showModal("Reply Sent", `Your feedback regarding "${proposal.title}" has been sent successfully.`);
    setReply('');
  };

  return (
    <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${isPending ? 'border-yellow-400' : 'border-red-500'}`}>
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{proposal.title}</h3>
        <div className={`flex items-center text-sm font-medium px-3 py-1 rounded-full ${isPending ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
          {isPending ? <FiClock className="mr-2" /> : <FiXCircle className="mr-2" />}
          {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
        </div>
      </div>
      {isRejected && (
        <div className="mt-4 border-t pt-4">
          <div className="flex items-start mb-4">
            <FiMessageSquare className="text-gray-500 mr-3 mt-1 flex-shrink-0" size={18} />
            <div>
              <p className="font-semibold text-gray-700">Supervisor's Feedback:</p>
              <p className="text-gray-600 italic">"{proposal.supervisorComment}"</p>
            </div>
          </div>
          <form onSubmit={handleReplySubmit} className="flex items-center gap-2">
            <input type="text" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type your reply..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
            <button type="submit" className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors" aria-label="Send Reply"><FiSend size={18} /></button>
          </form>
        </div>
      )}
    </div>
  );
};

// --- Main Page Component ---
const ProposalPage = () => {
  const [proposals, setProposals] = useState(mockProposals);
  const [modalState, setModalState] = useState({ isOpen: false, title: '', message: '' });

  const showModal = (title, message) => {
    setModalState({ isOpen: true, title, message });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, title: '', message: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    showModal("Proposal Submitted!", "Your project proposal has been sent to the supervisor for review.");
  };

  const canProposeNew = !proposals.some(p => p.status === 'pending');

  return (
    <DashboardLayout>
      <Modal isOpen={modalState.isOpen} onClose={closeModal} title={modalState.title}>
        <p>{modalState.message}</p>
      </Modal>

      <h1 className="text-3xl font-bold text-gray-900 mb-8">Project Proposals</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Submissions</h2>
        <div className="space-y-6">
          {proposals.length > 0 ? (
            proposals.map(p => <ProposalCard key={p.id} proposal={p} showModal={showModal} />)
          ) : (
            <p className="text-gray-500 bg-white p-6 rounded-lg shadow-md">You have not submitted any proposals yet.</p>
          )}
        </div>
      </section>

      {canProposeNew && (
        <section>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Propose a New Project</h2>
          <div className="bg-white p-8 rounded-xl shadow-md">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="projectTitle" className="block text-sm font-medium text-gray-700 mb-2">Project Title</label>
                <div className="relative">
                  <FiFileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input type="text" id="projectTitle" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" placeholder="e.g., The Future of Quantum Computing" required />
                </div>
              </div>
              <div>
                <label htmlFor="supervisor" className="block text-sm font-medium text-gray-700 mb-2">Select a Supervisor</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <select id="supervisor" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition appearance-none" required defaultValue="">
                    <option value="" disabled>Choose from available supervisors</option>
                    {supervisors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Project Description</label>
                <textarea id="description" rows="8" className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" placeholder="Provide a detailed description of your project..." required></textarea>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"><FiCheck size={20} />Submit Proposal</button>
              </div>
            </form>
          </div>
        </section>
      )}
    </DashboardLayout>
  );
};

export default ProposalPage;
