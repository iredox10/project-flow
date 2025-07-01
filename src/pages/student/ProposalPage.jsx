
import React, { useState, useEffect } from 'react';
import StudentLayout from '../../components/StudentLayout';
import NotificationModal from '../../components/NotificationModal';
import { FiFilePlus, FiSend, FiFileText, FiUser, FiClock, FiXCircle, FiLoader } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext'; // Import the useAuth hook
import {
  db,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  doc,
  getDoc,
  serverTimestamp
} from '../../firebase/config';

// --- New Proposal Modal ---
const ProposalModal = ({ isOpen, onClose, supervisor, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Reset form when modal opens
    if (isOpen) {
      setTitle('');
      setDescription('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // The supervisorId is now taken from the passed supervisor prop
      await onSubmit({ title, description, supervisorId: supervisor.id });
      onClose();
    } catch (err) {
      setError('Failed to submit proposal. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-30 backdrop-blur-md z-50 flex justify-center items-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Proposal</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="projectTitle" className="block text-sm font-medium text-gray-700 mb-2">Project Title</label>
            <div className="relative"><FiFileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" value={title} onChange={e => setTitle(e.target.value)} id="projectTitle" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required /></div>
          </div>
          <div>
            <label htmlFor="supervisor" className="block text-sm font-medium text-gray-700 mb-2">Assigned Supervisor</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" id="supervisor" value={supervisor?.name || 'Loading...'} className="w-full pl-10 pr-4 py-2 border bg-gray-100 border-gray-300 rounded-lg" disabled />
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">Project Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} id="description" rows="6" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required></textarea>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300">Cancel</button>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2" disabled={loading}>
              {loading ? <FiLoader className="animate-spin" /> : <FiSend />}
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
};


// --- Main Proposal Page Component ---
const ProposalPage = () => {
  const { currentUser } = useAuth(); // Use the hook to get the logged-in user
  const [proposals, setProposals] = useState([]);
  const [assignedSupervisor, setAssignedSupervisor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState({ isOpen: false, title: '', message: '' });

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // Fetch the assigned supervisor's details
    const fetchSupervisor = async () => {
      if (currentUser.assignedSupervisorId) {
        const supervisorDocRef = doc(db, "users", currentUser.assignedSupervisorId);
        const supervisorDoc = await getDoc(supervisorDocRef);
        if (supervisorDoc.exists()) {
          setAssignedSupervisor({ id: supervisorDoc.id, ...supervisorDoc.data() });
        }
      }
    };
    fetchSupervisor();

    // Fetch student's proposals using their actual ID
    const proposalsQuery = query(collection(db, "projects"), where("studentId", "==", currentUser.uid));
    const unsubProposals = onSnapshot(proposalsQuery, (snapshot) => {
      setProposals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => {
      unsubProposals();
    };
  }, [currentUser]);

  const showNotification = (title, message) => {
    setNotification({ isOpen: true, title, message, type: 'success' });
  };

  const handleProposalSubmit = async ({ title, description, supervisorId }) => {
    if (!currentUser) throw new Error("No user logged in to submit a proposal.");

    await addDoc(collection(db, "projects"), {
      title,
      description,
      supervisorId,
      studentId: currentUser.uid,
      studentName: currentUser.name,
      status: 'pending',
      dateSubmitted: serverTimestamp()
    });
    showNotification('Success!', 'Your project proposal has been submitted for review.');
  };

  const canProposeNew = !proposals.some(p => p.status === 'pending');
  const isSupervisorAssigned = !!assignedSupervisor;

  return (
    <StudentLayout>
      <NotificationModal isOpen={notification.isOpen} onClose={() => setNotification({ ...notification, isOpen: false })} title={notification.title} message={notification.message} />
      <ProposalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} supervisor={assignedSupervisor} onSubmit={handleProposalSubmit} />

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Project Proposal</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          disabled={!canProposeNew || !isSupervisorAssigned || loading || !currentUser}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          title={!isSupervisorAssigned ? "You must be assigned a supervisor first" : !canProposeNew ? "You have a proposal pending review" : "Create a new proposal"}
        >
          <FiFilePlus />
          Create New Proposal
        </button>
      </div>

      <section>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Submission History</h2>
        {loading ? <div className="text-center p-8"><FiLoader className="animate-spin mx-auto" /></div> : (
          <div className="space-y-6">
            {!currentUser ? <p className="text-center text-gray-500">Please log in to see your proposals.</p> :
              proposals.length > 0 ? proposals.map(p => (
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
        )}
      </section>

    </StudentLayout>
  );
};

export default ProposalPage;
