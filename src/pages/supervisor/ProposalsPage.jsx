
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SupervisorLayout from '../../components/SupervisorLayout';
import { FiFileText, FiUser, FiSearch, FiInbox, FiLoader } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import {
  db,
  collection,
  query,
  where,
  onSnapshot,
  orderBy
} from '../../firebase/config';

const ProposalCard = ({ proposal }) => (
  <div className="bg-white p-6 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-lg transition-shadow">
    <div className="flex-grow">
      <h3 className="text-xl font-bold text-gray-800">{proposal.title}</h3>
      <div className="flex items-center text-sm text-gray-500 mt-2">
        <FiUser className="mr-2" />
        <span>Submitted by: {proposal.studentName}</span>
      </div>
    </div>
    <div className="flex flex-col items-start md:items-end w-full md:w-auto">
      <p className="text-xs text-gray-400 mb-2">
        {proposal.dateSubmitted ? new Date(proposal.dateSubmitted.toDate()).toLocaleDateString() : 'Just now'}
      </p>
      <Link
        to={`/supervisor/proposal/${proposal.id}`}
        className="w-full md:w-auto text-center bg-teal-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
      >
        Review Proposal
      </Link>
    </div>
  </div>
);

const ProposalsPage = () => {
  const { currentUser } = useAuth();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    // Query for projects that are assigned to the current supervisor and are pending
    const proposalsQuery = query(
      collection(db, "projects"),
      where("supervisorId", "==", currentUser.uid),
      where("status", "==", "pending"),
      orderBy("dateSubmitted", "desc")
    );

    const unsubscribe = onSnapshot(proposalsQuery, (snapshot) => {
      const fetchedProposals = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProposals(fetchedProposals);
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [currentUser]);


  const filteredProposals = useMemo(() =>
    proposals.filter(p =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.studentName && p.studentName.toLowerCase().includes(searchTerm.toLowerCase()))
    ), [proposals, searchTerm]);

  return (
    <SupervisorLayout>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pending Proposals</h1>
        <div className="relative mt-4 md:mt-0">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by title or student..."
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>
      </div>
      {loading ? (
        <div className="text-center py-16"><FiLoader className="animate-spin mx-auto text-teal-500" size={48} /></div>
      ) : (
        <div className="space-y-6">
          {filteredProposals.length > 0 ? (
            filteredProposals.map(proposal => <ProposalCard key={proposal.id} proposal={proposal} />)
          ) : (
            <div className="text-center py-16 bg-white rounded-xl shadow-md">
              <FiInbox size={60} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700">All Caught Up!</h3>
              <p className="text-gray-500 mt-2">There are no pending proposals to review at this time.</p>
            </div>
          )}
        </div>
      )}
    </SupervisorLayout>
  );
};

export default ProposalsPage;
