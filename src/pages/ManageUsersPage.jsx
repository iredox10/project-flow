
import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../components/AdminLayout';
import NotificationModal from '../components/NotificationModal'
import ConfirmationModal from '../components/ConfirmationModal'
import UserModal from '../components/UserModal'
import { FiUserPlus, FiEdit, FiTrash2, FiLoader, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import {
  db,
  auth,
  collection,
  query,
  where,
  onSnapshot,
  setDoc,
  doc,
  updateDoc,
  deleteDoc,
  createUserWithEmailAndPassword
} from '../firebase/config';

// --- Pagination Component ---
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex justify-center items-center p-4">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 disabled:opacity-50"><FiChevronLeft /></button>
      <span className="mx-4 text-sm">Page {currentPage} of {totalPages}</span>
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 disabled:opacity-50"><FiChevronRight /></button>
    </div>
  );
};

// --- Main Manage Users Page ---
const ManageUsersPage = () => {
  const [modalState, setModalState] = useState({ isOpen: false, mode: 'add', data: null });
  const [deleteConfirmState, setDeleteConfirmState] = useState({ isOpen: false, user: null });
  const [notification, setNotification] = useState({ isOpen: false, title: '', message: '', type: 'success' });
  const [users, setUsers] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  const showNotification = (title, message, type = 'success') => setNotification({ isOpen: true, title, message, type });

  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "in", ["student", "supervisor"]));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedUsers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(fetchedUsers);
      setSupervisors(fetchedUsers.filter(u => u.role === 'supervisor'));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredUsers = useMemo(() => {
    const roleToFilter = activeTab.slice(0, -1);
    return users.filter(user =>
      user.role === roleToFilter &&
      (user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [users, activeTab, searchTerm]);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const currentUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

  const handleSaveUser = async (userData, userId) => {
    if (modalState.mode === 'edit') {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        name: userData.name,
        regNumber: userData.regNumber,
        assignedSupervisorId: userData.assignedSupervisorId
      });
      showNotification('Success', `User "${userData.name}" has been updated.`);
    } else {
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        regNumber: userData.role === 'student' ? userData.regNumber : null,
        assignedSupervisorId: userData.role === 'student' ? userData.assignedSupervisorId : null,
      });
      showNotification('Success', `User "${userData.name}" has been created successfully.`);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirmState.user) return;
    await deleteDoc(doc(db, "users", deleteConfirmState.user.id));
    showNotification('Success', `User "${deleteConfirmState.user.name}" has been deleted.`, 'success');
    setDeleteConfirmState({ isOpen: false, user: null });
  };

  const openModal = (mode = 'add', userData = null) => {
    setModalState({ isOpen: true, mode, data: userData });
  };

  return (
    <AdminLayout>
      <NotificationModal isOpen={notification.isOpen} onClose={() => setNotification({ ...notification, isOpen: false })} title={notification.title} message={notification.message} type={notification.type} />
      <UserModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ isOpen: false, mode: 'add', data: null })}
        onSave={handleSaveUser}
        // onAddUsersFromFile={handleAddUsersFromFile} // This can be re-added if needed
        userData={modalState.data}
        isEditMode={modalState.mode === 'edit'}
        supervisors={supervisors}
        initialRole={activeTab.slice(0, -1)}
      />
      <ConfirmationModal isOpen={deleteConfirmState.isOpen} onClose={() => setDeleteConfirmState({ isOpen: false, user: null })} onConfirm={handleDeleteUser} title="Delete User?" message={`Are you sure you want to delete "${deleteConfirmState.user?.name}"? This action cannot be undone.`} />

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
        <div className="w-full md:w-auto flex gap-4">
          <div className="relative flex-grow"><FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-purple-500" /></div>
          <button onClick={() => openModal('add')} className="inline-flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-purple-700">
            <FiUserPlus />
            {activeTab === 'students' ? 'Add Student' : 'Add Supervisor'}
          </button>
        </div>
      </div>

      <div className="mb-6 flex border-b"><button onClick={() => { setActiveTab('students'); setCurrentPage(1); }} className={`py-2 px-4 text-lg font-medium ${activeTab === 'students' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}>Students</button><button onClick={() => { setActiveTab('supervisors'); setCurrentPage(1); }} className={`py-2 px-4 text-lg font-medium ${activeTab === 'supervisors' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}>Supervisors</button></div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? <div className="p-8 text-center flex justify-center items-center gap-2"><FiLoader className="animate-spin" /><span>Loading Users...</span></div> : (
          <>
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 font-semibold text-gray-600">Name</th>
                  {activeTab === 'students' && <th className="p-4 font-semibold text-gray-600">Reg. Number</th>}
                  <th className="p-4 font-semibold text-gray-600">Email</th>
                  <th className="p-4 font-semibold text-gray-600">{activeTab === 'students' ? 'Supervisor' : 'Assigned Students'}</th>
                  <th className="p-4 font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map(user => (
                  <tr key={user.id} className="border-b last:border-b-0">
                    <td className="p-4 font-medium">{user.name}</td>
                    {activeTab === 'students' && <td className="p-4 text-gray-600">{user.regNumber || 'N/A'}</td>}
                    <td className="p-4 text-gray-600">{user.email}</td>
                    <td className="p-4 text-gray-600">
                      {activeTab === 'students'
                        ? (supervisors.find(s => s.id === user.assignedSupervisorId)?.name || 'N/A')
                        : (users.filter(s => s.role === 'student' && s.assignedSupervisorId === user.id).length)
                      }
                    </td>
                    <td className="p-4">
                      <div className="flex gap-4">
                        <button onClick={() => openModal('edit', user)} className="text-gray-500 hover:text-purple-600"><FiEdit /></button>
                        <button onClick={() => setDeleteConfirmState({ isOpen: true, user })} className="text-gray-500 hover:text-red-600"><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageUsersPage;
