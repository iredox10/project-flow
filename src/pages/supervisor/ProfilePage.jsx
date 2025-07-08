
import React, { useState, useEffect } from 'react';
import SupervisorLayout from '../../components/SupervisorLayout';
import  NotificationModal  from '../../components/NotificationModal';
import { FiUser, FiMail, FiLock, FiSave, FiCamera, FiLoader, FiUsers } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { 
    db,
    collection,
    query,
    where,
    onSnapshot,
    auth,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential
} from '../../firebase/config';

const SupervisorProfilePage = () => {
    const { currentUser } = useAuth();
    const [name, setName] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [assignedStudents, setAssignedStudents] = useState([]);
    const [loading, setLoading] = useState({ password: false, students: true });
    const [notification, setNotification] = useState({ isOpen: false, title: '', message: '', type: 'success' });

    useEffect(() => {
        if (currentUser) {
            setName(currentUser.name || '');
            
            // Fetch students assigned to this supervisor
            const studentsQuery = query(collection(db, "users"), where("assignedSupervisorId", "==", currentUser.uid));
            const unsubscribe = onSnapshot(studentsQuery, (snapshot) => {
                const studentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAssignedStudents(studentsData);
                setLoading(prev => ({ ...prev, students: false }));
            });

            return () => unsubscribe();
        }
    }, [currentUser]);

    const showNotification = (title, message, type = 'success') => {
        setNotification({ isOpen: true, title, message, type });
    };
    
    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setLoading(prev => ({ ...prev, password: true }));

        const user = auth.currentUser;
        const credential = EmailAuthProvider.credential(user.email, currentPassword);

        try {
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            showNotification('Success', 'Your password has been updated successfully.');
            setCurrentPassword('');
            setNewPassword('');
        } catch (error) {
            console.error("Error updating password:", error);
            showNotification('Error', 'Failed to update password. Please check your current password and try again.', 'error');
        } finally {
            setLoading(prev => ({ ...prev, password: false }));
        }
    };

    if (!currentUser) {
        return <SupervisorLayout><div className="text-center p-8"><FiLoader className="animate-spin mx-auto" size={48} /></div></SupervisorLayout>;
    }

    return (
        <SupervisorLayout>
            <NotificationModal isOpen={notification.isOpen} onClose={() => setNotification({ ...notification, isOpen: false })} title={notification.title} message={notification.message} type={notification.type} />
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-md text-center">
                        <div className="relative w-32 h-32 mx-auto mb-4">
                            <img 
                                src={`https://placehold.co/128x128/D1FAE5/065F46?text=${name.charAt(0)}`} 
                                alt="Profile Avatar"
                                className="rounded-full w-full h-full object-cover border-4 border-white shadow-sm" 
                            />
                            <button className="absolute bottom-0 right-0 bg-teal-600 text-white p-2 rounded-full hover:bg-teal-700 transition-colors">
                                <FiCamera size={16}/>
                            </button>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">{name}</h2>
                        <p className="text-gray-500">{currentUser.email}</p>
                    </div>
                     <div className="bg-white p-6 rounded-xl shadow-md mt-8">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><FiUsers /> Assigned Students</h3>
                        {loading.students ? <FiLoader className="animate-spin" /> : (
                            <ul className="space-y-2">
                                {assignedStudents.map(student => (
                                    <li key={student.id} className="text-gray-700">{student.name}</li>
                                ))}
                                {assignedStudents.length === 0 && <p className="text-sm text-gray-500">No students are currently assigned to you.</p>}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Right Column: Edit Forms */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Change Password Form */}
                    <div className="bg-white p-8 rounded-xl shadow-md">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">Change Password</h3>
                         <form onSubmit={handlePasswordUpdate} className="space-y-6">
                            <div>
                                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                                <div className="relative">
                                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="password" id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" required />
                                </div>
                            </div>
                             <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                <div className="relative">
                                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500" required />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button type="submit" className="inline-flex items-center justify-center gap-2 bg-gray-700 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-800 w-40" disabled={loading.password}>
                                    {loading.password ? <FiLoader className="animate-spin" /> : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </SupervisorLayout>
    );
};

export default SupervisorProfilePage;
