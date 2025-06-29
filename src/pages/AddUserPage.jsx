
import React, { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { FiUserPlus, FiMail, FiUser, FiUsers, FiCheckCircle } from 'react-icons/fi';

// --- Reusable Modal Component ---
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-30 backdrop-blur-md z-50 flex justify-center items-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md text-center">
        <FiCheckCircle className="mx-auto text-green-500 mb-4" size={48} />
        <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
        <div className="mt-3 text-gray-600">{children}</div>
        <div className="mt-8"><button onClick={onClose} className="bg-purple-600 text-white px-8 py-2.5 rounded-lg font-semibold hover:bg-purple-700 transition-colors">OK</button></div>
      </div>
    </div>
  );
};

// --- Mock Data ---
const supervisors = [
  { id: 1, name: 'Dr. Ada Lovelace' },
  { id: 2, name: 'Dr. Alan Turing' },
  { id: 3, name: 'Dr. Grace Hopper' },
];

const AddUserPage = () => {
  const [role, setRole] = useState('student');
  const [modalState, setModalState] = useState({ isOpen: false, title: '', message: '' });

  const showModal = (title, message) => setModalState({ isOpen: true, title, message });
  const closeModal = () => setModalState({ isOpen: false, title: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('fullName');
    showModal("User Created", `The account for ${name} (${role}) has been created successfully.`);
    e.target.reset();
  };

  return (
    <AdminLayout>
      <Modal isOpen={modalState.isOpen} onClose={closeModal} title={modalState.title}>
        <p>{modalState.message}</p>
      </Modal>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Add a New User</h1>
      <div className="bg-white p-8 rounded-xl shadow-md max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <div className="relative"><FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" name="fullName" id="fullName" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="e.g., John Doe" required /></div>
          </div>
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <div className="relative"><FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="email" name="email" id="email" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="user@example.com" required /></div>
          </div>
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">User Role</label>
            <select id="role" name="role" onChange={(e) => setRole(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none">
              <option value="student">Student</option>
              <option value="supervisor">Supervisor</option>
            </select>
          </div>
          {/* Supervisor Assignment (Conditional) */}
          {role === 'student' && (
            <div>
              <label htmlFor="supervisor" className="block text-sm font-medium text-gray-700 mb-2">Assign Supervisor</label>
              <div className="relative"><FiUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><select name="supervisor" id="supervisor" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none appearance-none" required><option value="" disabled selected>Choose a supervisor</option>{supervisors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            </div>
          )}
          {/* Submit Button */}
          <div className="flex justify-end pt-4"><button type="submit" className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"><FiUserPlus size={20} />Create User Account</button></div>
        </form>
      </div>
    </AdminLayout>
  );
};
export default AddUserPage;
