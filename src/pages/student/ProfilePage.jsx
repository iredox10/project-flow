
import React, { useState } from 'react';
import StudentLayout from '../../components/StudentLayout';
import { FiUser, FiMail, FiLock, FiSave, FiCamera } from 'react-icons/fi';

// Mock Data for the current user
const currentUser = {
  name: 'Ethan Hunt',
  email: 'ethan.h@university.edu',
  avatarUrl: 'https://placehold.co/128x128/E0E7FF/4F46E5?text=EH'
};

const ProfilePage = () => {
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    alert('Profile updated successfully!');
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    alert('Password updated successfully!');
  };

  return (
    <StudentLayout>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-md text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <img
                src={currentUser.avatarUrl}
                alt="Profile Avatar"
                className="rounded-full w-full h-full object-cover border-4 border-white shadow-sm"
              />
              <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                <FiCamera size={16} />
              </button>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{name}</h2>
            <p className="text-gray-500">{email}</p>
          </div>
        </div>

        {/* Right Column: Edit Forms */}
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Information Form */}
          <div className="bg-white p-8 rounded-xl shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Personal Information</h3>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" id="fullName" value={name} onChange={(e) => setName(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700">
                  <FiSave size={18} />Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white p-8 rounded-xl shadow-md">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Change Password</h3>
            <form onSubmit={handlePasswordUpdate} className="space-y-6">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="password" id="currentPassword" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="password" id="newPassword" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="submit" className="inline-flex items-center gap-2 bg-gray-700 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-800">
                  Update Password
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
