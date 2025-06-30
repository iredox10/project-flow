
import React, { useState } from 'react';
import StudentLayout from '../../components/StudentLayout';
import { FiFilePlus, FiSend, FiFileText, FiUser, FiClock, FiXCircle } from 'react-icons/fi';

// --- Mock Data ---
const mockProposals = [
  {
    id: 1,
    title: 'An Analysis of Reinforcement Learning in Game AI',
    status: 'rejected',
    supervisorComment: 'This topic is a bit too broad. Can you narrow it down?',
    studentReply: 'Thank you for the feedback. I will refine the scope and resubmit.',
  },
  // To test the "pending" state, you can uncomment this block
  /*
  {
    id: 2,
    title: 'The Future of Quantum Computing',
    status: 'pending',
    supervisorComment: null,
    studentReply: null,
  }
  */
];

const supervisors = [
  { id: 1, name: 'Dr. Ada Lovelace' },
  { id: 2, name: 'Dr. Alan Turing' },
  { id: 3, name: 'Dr. Grace Hopper' },
];

// --- New Proposal Modal ---
const ProposalModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-30 backdrop-blur-md z-50 flex justify-center items-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Proposal</h2>
        <form className="space-y-6">
          <div>
            <label htmlFor="projectTitle" className="block text-sm font-medium text-gray-700 mb-2">Project Title</label>
            <div className="relative"><FiFileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" id="projectTitle" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required /></div>
          </div>
          <div>
            <label htmlFor="supervisor" className="block text-sm font-medium text-gray-700 mb-2">Select Supervisor</label>
            <div className="relative"><FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><select id="supervisor" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg appearance-none focus:ring-2 focus:ring-blue-500" required defaultValue=""><option value="" disabled>Choose a supervisor</option>{supervisors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Project Description</label>
            <textarea id="description" rows="6" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required></textarea>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300">Cancel</button>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2"><FiSend />Submit</button>
          </div>
        </form>
      </div>
    </div>
  )
};


// --- Main Proposal Page Component ---
const ProposalPage = () => {
  const [proposals] = useState(mockProposals);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const canProposeNew = !proposals.some(p => p.status === 'pending');

  return (
    <StudentLayout>
      <ProposalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Title and Action Button */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Project Proposal</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={!canProposeNew}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          title={!canProposeNew ? "You have a proposal pending review" : "Create a new proposal"}
        >
          <FiFilePlus />
          Create New Proposal
        </button>
      </div>

      {/* History Section */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Submission History</h2>
        <div className="space-y-6">
          {proposals.length > 0 ? proposals.map(p => (
            <div key={p.id} className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${p.status === 'pending' ? 'border-yellow-400' : 'border-red-500'}`}>
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{p.title}</h3>
                <div className={`flex items-center text-sm font-medium px-3 py-1 rounded-full ${p.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                  {p.status === 'pending' ? <FiClock className="mr-2" /> : <FiXCircle className="mr-2" />}
                  {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                </div>
              </div>
              {p.supervisorComment && (
                <div className="mt-4 border-t pt-4">
                  <p className="font-semibold text-gray-700">Supervisor's Feedback:</p>
                  <p className="text-gray-600 italic">"{p.supervisorComment}"</p>
                  {p.studentReply && <p className="mt-2 text-sm text-gray-500 pl-4 border-l-2"><strong>Your reply:</strong> "{p.studentReply}"</p>}
                </div>
              )}
            </div>
          )) : (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <FiFileText size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700">No Submission History</h3>
              <p className="text-gray-500 mt-2">Click "Create New Proposal" to get started.</p>
            </div>
          )}
        </div>
      </section>

    </StudentLayout>
  );
};

export default ProposalPage;
