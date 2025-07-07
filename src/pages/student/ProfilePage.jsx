
import React, { useState, useEffect } from 'react';
import StudentLayout from '../../components/StudentLayout';
import  NotificationModal  from '../../components/NotificationModal';
import { FiUser, FiMail, FiLock, FiSave, FiCamera, FiLoader } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { 
    db,
    doc,
    updateDoc,
    auth,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential
} from '../../firebase/config';

const ProfilePage = () => {
    const { currentUser } = useAuth();
    const [name, setName] = useState('');
    const [regNumber, setRegNumber] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState({ password: false });
    const [notification, setNotification] = useState({ isOpen: false, title: '', message: '', type: 'success' });

    useEffect(() => {
        if (currentUser) {
            setName(currentUser.name || '');
            setRegNumber(currentUser.regNumber || '');
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
            // Re-authenticate user before changing password for security
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
        return <StudentLayout><div className="text-center p-8"><FiLoader className="animate-spin mx-auto" size={48} /></div></StudentLayout>;
    }

    return (
        <StudentLayout>
            <NotificationModal isOpen={notification.isOpen} onClose={() => setNotification({ ...notification, isOpen: false })} title={notification.title} message={notification.message} type={notification.type} />
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-md text-center">
                        <div className="relative w-32 h-32 mx-auto mb-4">
                            <img 
                                src={`https://placehold.co/128x128/E0E7FF/4F46E5?text=${name.charAt(0)}`} 
                                alt="Profile Avatar"
                                className="rounded-full w-full h-full object-cover border-4 border-white shadow-sm" 
                            />
                            <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                                <FiCamera size={16}/>
                            </button>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">{name}</h2>
                        <p className="text-gray-500">{currentUser.email}</p>
                        <p className="text-gray-500 mt-1">Reg No: {regNumber}</p>
                    </div>
                </div>

                {/* Right Column: Edit Forms */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Personal Information Display */}
                    <div className="bg-white p-8 rounded-xl shadow-md">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">Personal Information</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                                <div className="relative mt-1">
                                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="text" id="fullName" value={name} className="w-full pl-10 pr-4 py-2 border bg-gray-100 border-gray-300 rounded-lg cursor-not-allowed" disabled />
                                </div>
                            </div>
                             <div>
                                <label htmlFor="regNumber" className="block text-sm font-medium text-gray-700">Registration Number</label>
                                <div className="relative mt-1">
                                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="text" id="regNumber" value={regNumber} className="w-full pl-10 pr-4 py-2 border bg-gray-100 border-gray-300 rounded-lg cursor-not-allowed" disabled />
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 pt-2">Your name and registration number are managed by the administration. Please contact them if there is an error.</p>
                        </div>
                    </div>

                    {/* Change Password Form */}
                    <div className="bg-white p-8 rounded-xl shadow-md">
                        <h3 className="text-xl font-bold text-gray-800 mb-6">Change Password</h3>
                         <form onSubmit={handlePasswordUpdate} className="space-y-6">
                            <div>
                                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                                <div className="relative">
                                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="password" id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
                                </div>
                            </div>
                             <div>
                                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                <div className="relative">
                                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" required />
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
        </StudentLayout>
    );
};

export default ProfilePage;
