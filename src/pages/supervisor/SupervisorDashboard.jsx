
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import SupervisorLayout from '../../components/SupervisorLayout';
import { FiUsers, FiFilePlus, FiClock, FiLoader, FiInbox, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { db, collection, query, where, onSnapshot } from '../../firebase/config';

// --- Reusable Stat Card Component ---
const StatCard = ({ icon, title, value, color, loading }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        <div className={`p-4 rounded-full mr-4 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            {loading ? <FiLoader className="animate-spin mt-2 text-gray-400" /> : <p className="text-3xl font-bold text-gray-900">{value}</p>}
        </div>
    </div>
);

const SupervisorDashboard = () => {
    const { currentUser } = useAuth();
    const [projects, setProjects] = useState([]);
    const [students, setStudents] = useState([]);
    const [reviewingChapters, setReviewingChapters] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        // Listener for projects assigned to this supervisor
        const projectsQuery = query(collection(db, "projects"), where("supervisorId", "==", currentUser.uid));
        const unsubProjects = onSnapshot(projectsQuery, (snapshot) => {
            const projectIds = snapshot.docs.map(doc => doc.id);
            setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

            // Fetch chapters that need review
            if (projectIds.length > 0) {
                const chaptersQuery = query(
                    collection(db, "chapters"),
                    where("projectId", "in", projectIds),
                    where("status", "==", "reviewing")
                );
                const unsubChapters = onSnapshot(chaptersQuery, (chaptersSnapshot) => {
                    setReviewingChapters(chaptersSnapshot.docs.map(doc => doc.data()));
                });
                return () => unsubChapters();
            }
        });

        // Listener for students assigned to this supervisor
        const studentsQuery = query(collection(db, "users"), where("assignedSupervisorId", "==", currentUser.uid));
        const unsubStudents = onSnapshot(studentsQuery, (snapshot) => {
            setStudents(snapshot.docs.map(doc => doc.data()));
            setLoading(false); // Consider loading done when students are fetched
        });

        return () => {
            unsubProjects();
            unsubStudents();
        };
    }, [currentUser]);

    // Calculate stats based on the live data
    const stats = useMemo(() => {
        const pendingProposals = projects.filter(p => p.status === 'pending');
        return {
            supervising: students.length,
            pendingProposalsCount: pendingProposals.length,
            chaptersForReview: reviewingChapters.length,
            activeProjects: projects.filter(p => p.status === 'approved').length,
            pendingProposalsList: pendingProposals,
        };
    }, [students, projects, reviewingChapters]);

    return (
        <SupervisorLayout>
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Welcome, {currentUser?.name}!</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={<FiUsers size={24} className="text-blue-500" />}
                    title="Supervising"
                    value={stats.supervising}
                    color="bg-blue-100"
                    loading={loading}
                />
                <StatCard
                    icon={<FiFilePlus size={24} className="text-yellow-500" />}
                    title="Pending Proposals"
                    value={stats.pendingProposalsCount}
                    color="bg-yellow-100"
                    loading={loading}
                />
                <StatCard
                    icon={<FiClock size={24} className="text-green-500" />}
                    title="Active Projects"
                    value={stats.activeProjects}
                    color="bg-green-100"
                    loading={loading}
                />
                <StatCard
                    icon={<FiCheckCircle size={24} className="text-red-500" />}
                    title="Chapters for Review"
                    value={stats.chaptersForReview}
                    color="bg-red-100"
                    loading={loading}
                />
            </div>

            {/* Pending Proposals List */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Pending Proposals for Review</h2>
                <div className="space-y-4">
                    {loading ? <div className="text-center p-4"><FiLoader className="animate-spin mx-auto" /></div> :
                        stats.pendingProposalsList.length > 0 ? (
                            stats.pendingProposalsList.map(proposal => (
                                <div key={proposal.id} className="flex flex-col md:flex-row items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-gray-800">{proposal.title}</p>
                                        <p className="text-sm text-gray-500">Submitted by: {proposal.studentName}</p>
                                    </div>
                                    <Link to={`/supervisor/proposal/${proposal.id}`} className="mt-2 md:mt-0 bg-teal-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-teal-700 transition-colors">
                                        Review Proposal
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <FiInbox size={48} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500">No pending proposals at this time.</p>
                            </div>
                        )}
                </div>
            </div>

        </SupervisorLayout>
    );
};

export default SupervisorDashboard;
