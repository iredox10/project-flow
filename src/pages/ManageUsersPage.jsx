
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { FiEdit, FiTrash2, FiSearch, FiUserPlus, FiChevronLeft, FiChevronRight, FiUploadCloud, FiUser, FiMail, FiUsers } from 'react-icons/fi';

// --- Reusable Add User Modal Component ---
const AddUserModal = ({ isOpen, onClose, role }) => {
  const [addMethod, setAddMethod] = useState('manual'); // 'manual' or 'upload'

  if (!isOpen) return null;

  // Mock Data for supervisor dropdown
  const supervisors = [
    { id: 1, name: 'Dr. Ada Lovelace' },
    { id: 2, name: 'Dr. Alan Turing' },
    { id: 3, name: 'Dr. Grace Hopper' },
  ];

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Logic to add user based on form data
    alert('User added successfully!');
    onClose();
  };

  const handleFileUpload = (e) => {
    e.preventDefault();
    // Logic to process uploaded file
    alert('File uploaded for processing!');
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-30 backdrop-blur-md z-50 flex justify-center items-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New {role === 'students' ? 'Student' : 'Supervisor'}</h2>
        {/* Modal Tabs */}
        <div className="flex border-b mb-6">
          <button onClick={() => setAddMethod('manual')} className={`py-2 px-4 font-medium ${addMethod === 'manual' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}>
            Manual Entry
          </button>
          <button onClick={() => setAddMethod('upload')} className={`py-2 px-4 font-medium ${addMethod === 'upload' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}>
            Upload Excel File
          </button>
        </div>

        {/* Conditional Form */}
        {addMethod === 'manual' ? (
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <div className="relative"><FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" name="fullName" id="fullName" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="e.g., John Doe" required /></div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative"><FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="email" name="email" id="email" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="user@example.com" required /></div>
            </div>
            {role === 'students' && (
              <div>
                <label htmlFor="supervisor" className="block text-sm font-medium text-gray-700 mb-2">Assign Supervisor</label>
                <div className="relative"><FiUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><select name="supervisor" id="supervisor" className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none appearance-none" required><option value="" disabled selected>Choose a supervisor</option>{supervisors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
              </div>
            )}
            <div className="flex justify-end gap-4 pt-4">
              <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300">Cancel</button>
              <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700">Add User</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleFileUpload} className="text-center">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center">
              <FiUploadCloud size={60} className="text-gray-400 mb-4" />
              <p className="font-semibold text-gray-700">Drag and drop your Excel file here</p>
              <p className="text-sm text-gray-500 mt-1">or</p>
              <input type="file" id="file-upload" className="sr-only" accept=".xlsx, .xls, .csv" />
              <label htmlFor="file-upload" className="mt-4 cursor-pointer bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-semibold hover:bg-purple-200">
                Browse File
              </label>
            </div>
            <p className="text-sm text-gray-500 mt-4">Don't have a template? <a href="#" className="text-purple-600 font-semibold hover:underline">Download it here.</a></p>
            <div className="flex justify-end gap-4 pt-6">
              <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300">Cancel</button>
              <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700">Upload and Add</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};


// --- Mock Data ---
const users = [
  { id: 1, name: 'Alice Johnson', email: 'alice.j@university.edu', role: 'Student', supervisor: 'Dr. Alan Turing' }, { id: 3, name: 'Bob Williams', email: 'bob.w@university.edu', role: 'Student', supervisor: 'Dr. Grace Hopper' }, { id: 4, name: 'Charlie Brown', email: 'charlie.b@university.edu', role: 'Student', supervisor: 'Dr. Alan Turing' }, { id: 6, name: 'Diana Prince', email: 'diana.p@university.edu', role: 'Student', supervisor: 'Dr. Ada Lovelace' }, { id: 7, name: 'Ethan Hunt', email: 'ethan.h@university.edu', role: 'Student', supervisor: 'Dr. Grace Hopper' }, { id: 9, name: 'Fiona Glenanne', email: 'fiona.g@university.edu', role: 'Student', supervisor: 'Dr. Ada Lovelace' }, { id: 11, name: 'George Costanza', email: 'george.c@university.edu', role: 'Student', supervisor: 'Dr. Alan Turing' }, { id: 2, name: 'Dr. Alan Turing', email: 'alan.t@university.edu', role: 'Supervisor', supervisor: null }, { id: 5, name: 'Dr. Grace Hopper', email: 'grace.h@university.edu', role: 'Supervisor', supervisor: null }, { id: 8, name: 'Dr. Ada Lovelace', email: 'ada.l@university.edu', role: 'Supervisor', supervisor: null }, { id: 10, name: 'Dr. Ian Malcolm', email: 'ian.m@university.edu', role: 'Supervisor', supervisor: null },
];

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-center items-center p-4">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 disabled:opacity-50"><FiChevronLeft /></button>
      <div className="flex items-center gap-2 mx-4"><span>Page {currentPage} of {totalPages}</span></div>
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 disabled:opacity-50"><FiChevronRight /></button>
    </div>
  );
};

const ManageUsersPage = () => {
  const [activeTab, setActiveTab] = useState('students');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const usersPerPage = 5;

  const filteredUsers = useMemo(() => users.filter(user => user.role.toLowerCase() === activeTab.slice(0, -1)), [activeTab]);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const currentUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

  return (
    <AdminLayout>
      <AddUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} role={activeTab} />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
        <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
          <FiUserPlus size={20} />
          {activeTab === 'students' ? 'Add Student' : 'Add Supervisor'}
        </button>
      </div>

      <div className="mb-6 flex border-b"><button onClick={() => { setActiveTab('students'); setCurrentPage(1); }} className={`py-2 px-4 text-lg font-medium ${activeTab === 'students' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}>Students</button><button onClick={() => { setActiveTab('supervisors'); setCurrentPage(1); }} className={`py-2 px-4 text-lg font-medium ${activeTab === 'supervisors' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}>Supervisors</button></div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left"><thead className="bg-gray-50 border-b"><tr><th className="p-4 text-sm font-semibold text-gray-600">Name</th><th className="p-4 text-sm font-semibold text-gray-600">Email</th><th className="p-4 text-sm font-semibold text-gray-600">{activeTab === 'students' ? 'Assigned Supervisor' : 'Assigned Students'}</th><th className="p-4 text-sm font-semibold text-gray-600">Actions</th></tr></thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr key={user.id} className="border-b last:border-b-0">
                  <td className="p-4 font-medium text-gray-900">{user.name}</td>
                  <td className="p-4 text-gray-600">{user.email}</td>
                  <td className="p-4 text-gray-600">{user.supervisor || 'N/A'}</td>
                  <td className="p-4"><div className="flex gap-4"><button className="text-gray-500 hover:text-purple-600"><FiEdit size={18} /></button><button className="text-gray-500 hover:text-red-600"><FiTrash2 size={18} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </AdminLayout>
  );
};

export default ManageUsersPage;
