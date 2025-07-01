
import React, { useState, useEffect, useMemo } from 'react';
import SuperAdminLayout from '../../components/SuperAdminLayout';
import { FiUserPlus, FiUploadCloud, FiMail, FiUser, FiEdit, FiTrash2, FiLoader, FiX, FiAlertTriangle, FiCheckCircle, FiInfo, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
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
} from '../../firebase/config';
import * as XLSX from 'xlsx';

// --- Reusable Notification Modal ---
const NotificationModal = ({ isOpen, onClose, title, message, type = 'success' }) => {
  if (!isOpen) return null;
  const icons = { success: <FiCheckCircle className="mx-auto text-green-500 mb-4" size={48} />, error: <FiAlertTriangle className="mx-auto text-red-500 mb-4" size={48} />, info: <FiInfo className="mx-auto text-blue-500 mb-4" size={48} /> };
  const buttonColors = { success: 'bg-green-600 hover:bg-green-700', error: 'bg-red-600 hover:bg-red-700', info: 'bg-blue-600 hover:bg-blue-700' };
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-30 backdrop-blur-md z-50 flex justify-center items-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md text-center" onClick={e => e.stopPropagation()}>
        {icons[type]}
        <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
        <p className="mt-2 text-gray-600">{message}</p>
        <div className="mt-8 flex justify-center"><button onClick={onClose} className={`text-white px-8 py-2.5 rounded-lg font-semibold ${buttonColors[type]}`}>OK</button></div>
      </div>
    </div>
  );
};

// --- Reusable Confirmation Modal ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-30 backdrop-blur-md z-50 flex justify-center items-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md text-center" onClick={e => e.stopPropagation()}>
        <FiAlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
        <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
        <p className="mt-2 text-gray-600">{message}</p>
        <div className="mt-8 flex justify-center gap-4">
          <button onClick={onClose} className="bg-gray-200 text-gray-800 px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-300">Cancel</button>
          <button onClick={onConfirm} className="bg-red-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-red-700">Confirm</button>
        </div>
      </div>
    </div>
  );
};

// --- Add/Edit Admin Modal ---
const AdminModal = ({ isOpen, onClose, onSave, onAddAdminsFromFile, adminData, isEditMode }) => {
  const [addMethod, setAddMethod] = useState('manual');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isEditMode && adminData) {
      setName(adminData.name);
      setEmail(adminData.email);
    } else {
      setName('');
      setEmail('');
    }
    setPassword('');
    setError('');
    setFile(null);
  }, [isOpen, isEditMode, adminData]);

  if (!isOpen) return null;

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isEditMode && password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    try {
      await onSave({ name, email, password }, adminData?.id);
      onClose();
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') setError('This email address is already in use.');
      else setError('Failed to save admin. Please try again.');
      console.error(err);
    }
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) { setError('Please select a file to upload.'); return; }
    setIsUploading(true);
    setError('');
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        if (json.length === 0) throw new Error("The selected file is empty or not formatted correctly.");
        await onAddAdminsFromFile(json);
        onClose();
      } catch (err) {
        setError('Failed to process file. Make sure it is a valid Excel file with columns: name, email, password.');
        console.error(err);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };
  const handleDownloadSample = () => {
    const sampleData = [{ name: 'Admin Example 1', email: 'admin.ex1@university.edu', password: 'password123' }, { name: 'Admin Example 2', email: 'admin.ex2@university.edu', password: 'password456' }];
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Admins");
    XLSX.writeFile(workbook, "admin_sample.xlsx");
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-30 backdrop-blur-md z-50 flex justify-center items-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{isEditMode ? 'Edit Admin' : 'Add New Admin'}</h2>
        {!isEditMode && (<div className="flex border-b mb-6"><button onClick={() => setAddMethod('manual')} className={`py-2 px-4 font-medium ${addMethod === 'manual' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-500'}`}>Manual Entry</button><button onClick={() => setAddMethod('upload')} className={`py-2 px-4 font-medium ${addMethod === 'upload' ? 'border-b-2 border-red-600 text-red-600' : 'text-gray-500'}`}>Upload File</button></div>)}
        {addMethod === 'manual' || isEditMode ? (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div><label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label><div className="relative"><FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" value={name} onChange={e => setName(e.target.value)} id="fullName" className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-red-500" required /></div></div>
            <div><label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label><div className="relative"><FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="email" value={email} onChange={e => setEmail(e.target.value)} id="email" className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-red-500" required disabled={isEditMode} /></div></div>
            {!isEditMode && (<div><label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Temporary Password</label><div className="relative"><FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="password" value={password} onChange={e => setPassword(e.target.value)} id="password" className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-red-500" required /></div></div>)}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-end gap-4 pt-4"><button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300">Cancel</button><button type="submit" className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700">{isEditMode ? 'Save Changes' : 'Add Admin'}</button></div>
          </form>
        ) : (
          <form onSubmit={handleFileUpload} className="text-center">
            <div className="border-2 border-dashed rounded-lg p-12 flex flex-col items-center"><FiUploadCloud size={60} className="mx-auto text-gray-400 mb-4" /><p className="font-semibold text-gray-700">{file ? file.name : 'Drag & drop your Excel file'}</p><p className="text-sm text-gray-500 mt-1">or</p><label htmlFor="file-upload" className="mt-4 cursor-pointer bg-red-100 text-red-700 px-4 py-2 rounded-lg font-semibold hover:bg-red-200">Browse File</label><input type="file" id="file-upload" className="sr-only" onChange={handleFileChange} accept=".xlsx, .xls, .csv" /></div>
            <p className="text-sm text-gray-500 mt-4">Don't have a template? <button type="button" onClick={handleDownloadSample} className="text-red-600 font-semibold hover:underline">Download it here.</button></p>
            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
            <div className="flex justify-end gap-4 pt-6"><button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300">Cancel</button><button type="submit" className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700" disabled={isUploading}>{isUploading ? <FiLoader className="animate-spin" /> : 'Upload & Add Admins'}</button></div>
          </form>
        )}
      </div>
    </div>
  );
};

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

const ManageAdminsPage = () => {
  const [modalState, setModalState] = useState({ isOpen: false, mode: 'add', data: null });
  const [deleteConfirmState, setDeleteConfirmState] = useState({ isOpen: false, admin: null });
  const [notification, setNotification] = useState({ isOpen: false, title: '', message: '', type: 'success' });
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const adminsPerPage = 5;

  const showNotification = (title, message, type = 'success') => setNotification({ isOpen: true, title, message, type });

  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "admin"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const adminsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAdmins(adminsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredAdmins = useMemo(() =>
    admins.filter(admin =>
      admin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase())
    ), [admins, searchTerm]
  );

  const totalPages = Math.ceil(filteredAdmins.length / adminsPerPage);
  const currentAdmins = filteredAdmins.slice((currentPage - 1) * adminsPerPage, currentPage * adminsPerPage);

  const handleSaveAdmin = async ({ name, email, password }, adminId) => {
    if (modalState.mode === 'edit') {
      const adminRef = doc(db, "users", adminId);
      await updateDoc(adminRef, { name });
      showNotification('Success', `Admin "${name}" has been updated.`);
    } else {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), { uid: user.uid, name, email, role: 'admin' });
      showNotification('Success', `Admin "${name}" has been created successfully.`);
    }
  };

  const handleAddAdminsFromFile = async (adminsFromFile) => {
    showNotification('Processing...', 'Your file is being processed. This might take a moment.', 'info');
    let successCount = 0, errorCount = 0;
    for (const admin of adminsFromFile) {
      try {
        if (admin.email && admin.password && admin.name) {
          await handleSaveAdmin(admin);
          successCount++;
        }
      } catch (error) {
        errorCount++;
        console.error(`Failed to add admin ${admin.email}:`, error.message);
      }
    }
    showNotification('Processing Complete', `${successCount} admins added successfully. ${errorCount} failed.`, 'success');
  };

  const handleDeleteAdmin = async () => {
    if (!deleteConfirmState.admin) return;
    await deleteDoc(doc(db, "users", deleteConfirmState.admin.id));
    showNotification('Success', `Admin "${deleteConfirmState.admin.name}" has been deleted.`, 'success');
    setDeleteConfirmState({ isOpen: false, admin: null });
  };

  const openModal = (mode = 'add', adminData = null) => setModalState({ isOpen: true, mode, data: adminData });

  return (
    <SuperAdminLayout>
      <NotificationModal isOpen={notification.isOpen} onClose={() => setNotification({ ...notification, isOpen: false })} title={notification.title} message={notification.message} type={notification.type} />
      <AdminModal isOpen={modalState.isOpen} onClose={() => setModalState({ isOpen: false, mode: 'add', data: null })} onSave={handleSaveAdmin} onAddAdminsFromFile={handleAddAdminsFromFile} adminData={modalState.data} isEditMode={modalState.mode === 'edit'} />
      <ConfirmationModal isOpen={deleteConfirmState.isOpen} onClose={() => setDeleteConfirmState({ isOpen: false, admin: null })} onConfirm={handleDeleteAdmin} title="Delete Admin?" message={`Are you sure you want to delete the admin "${deleteConfirmState.admin?.name}"? This action cannot be undone.`} />

      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Manage Admins</h1>
        <div className="w-full md:w-auto flex gap-4">
          <div className="relative flex-grow">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-red-500" />
          </div>
          <button onClick={() => openModal('add')} className="inline-flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-red-700">
            <FiUserPlus /> Add New Admin
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center flex justify-center items-center gap-2"><FiLoader className="animate-spin" /><span>Loading Admins...</span></div>
        ) : (
          <>
            <table className="w-full text-left">
              <thead className="bg-gray-50"><tr><th className="p-4 font-semibold">Name</th><th className="p-4 font-semibold">Email</th><th className="p-4 font-semibold">Actions</th></tr></thead>
              <tbody>
                {currentAdmins.map(admin => (
                  <tr key={admin.id} className="border-b last:border-b-0">
                    <td className="p-4 font-medium">{admin.name}</td>
                    <td className="p-4 text-gray-600">{admin.email}</td>
                    <td className="p-4"><div className="flex gap-4"><button onClick={() => openModal('edit', admin)} className="text-gray-500 hover:text-red-600"><FiEdit /></button><button onClick={() => setDeleteConfirmState({ isOpen: true, admin })} className="text-gray-500 hover:text-red-600"><FiTrash2 /></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        )}
      </div>
    </SuperAdminLayout>
  );
};

export default ManageAdminsPage;
