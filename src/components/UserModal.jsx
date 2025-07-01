
import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiUsers, FiUploadCloud, FiLoader } from 'react-icons/fi';
import * as XLSX from 'xlsx'

const UserModal = ({ isOpen, onClose, onSave, onAddUsersFromFile, userData, isEditMode, supervisors, initialRole }) => {
  const [addMethod, setAddMethod] = useState('manual');
  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [assignedSupervisorId, setAssignedSupervisorId] = useState('');
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isEditMode && userData) {
      setName(userData.name || '');
      setEmail(userData.email || '');
      setRole(userData.role || 'student');
      setRegNumber(userData.regNumber || '');
      setAssignedSupervisorId(userData.assignedSupervisorId || '');
    } else {
      setName('');
      setEmail('');
      setRole(initialRole);
      setRegNumber('');
      setAssignedSupervisorId('');
    }
    setPassword('');
    setError('');
    setFile(null);
  }, [isOpen, isEditMode, userData, initialRole]);

  if (!isOpen) return null;

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isEditMode && password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    try {
      const dataToSave = { name, email, password, role, regNumber, assignedSupervisorId };
      await onSave(dataToSave, userData?.id);
      onClose();
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') setError('This email address is already in use.');
      else if (err.code === 'permission-denied') setError('Permission Denied. Check your Firestore security rules.');
      else setError('Failed to save user. Please try again.');
      console.error("Firebase Save Error:", err);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
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

        if (json.length === 0) {
          throw new Error("The selected file is empty or not formatted correctly.");
        }

        await onAddUsersFromFile(json, role);
        onClose();
      } catch (err) {
        setError('Failed to process file. Make sure it has the correct columns (name, email, password, etc).');
        console.error(err);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDownloadSample = () => {
    let sampleData, fileName;
    if (role === 'student') {
      sampleData = [{ name: 'John Doe', email: 'john.doe@example.com', password: 'password123', regNumber: 'U2025/CS/001', supervisorEmail: 'supervisor@example.com' }];
      fileName = "student_sample.xlsx";
    } else { // supervisor
      sampleData = [{ name: 'Dr. Jane Smith', email: 'jane.smith@example.com', password: 'password123' }];
      fileName = "supervisor_sample.xlsx";
    }

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-30 backdrop-blur-md z-50 flex justify-center items-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{isEditMode ? 'Edit User' : `Add New ${role.charAt(0).toUpperCase() + role.slice(1)}s`}</h2>
        {!isEditMode && (
          <div className="flex border-b mb-6">
            <button onClick={() => setAddMethod('manual')} className={`py-2 px-4 font-medium ${addMethod === 'manual' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}>Manual Entry</button>
            <button onClick={() => setAddMethod('upload')} className={`py-2 px-4 font-medium ${addMethod === 'upload' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500'}`}>Upload File</button>
          </div>
        )}
        {addMethod === 'manual' || isEditMode ? (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div><label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">Full Name</label><div className="relative"><FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" value={name} onChange={e => setName(e.target.value)} id="fullName" className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-purple-500" required /></div></div>
            <div><label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address</label><div className="relative"><FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="email" value={email} onChange={e => setEmail(e.target.value)} id="email" className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-purple-500" required disabled={isEditMode} /></div></div>
            {!isEditMode && (<div><label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Temporary Password</label><div className="relative"><FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="password" value={password} onChange={e => setPassword(e.target.value)} id="password" className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-purple-500" required /></div></div>)}
            {isEditMode && (<div><label className="block text-sm font-medium text-gray-700 mb-2">User Role</label><input type="text" value={role} className="w-full p-2 border bg-gray-100 rounded-lg" disabled /></div>)}
            {role === 'student' && (
              <>
                <div><label htmlFor="regNumber" className="block text-sm font-medium text-gray-700 mb-2">Registration Number</label><div className="relative"><FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" value={regNumber} onChange={e => setRegNumber(e.target.value)} id="regNumber" className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-purple-500" required /></div></div>
                <div><label htmlFor="supervisor" className="block text-sm font-medium text-gray-700 mb-2">Assign Supervisor (Optional)</label><div className="relative"><FiUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><select value={assignedSupervisorId} onChange={e => setAssignedSupervisorId(e.target.value)} id="supervisor" className="w-full pl-10 pr-4 py-2 border rounded-lg appearance-none focus:ring-purple-500"><option value="">Not Assigned</option>{supervisors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div></div>
              </>
            )}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-end gap-4 pt-4"><button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300">Cancel</button><button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700">{isEditMode ? 'Save Changes' : 'Create User'}</button></div>
          </form>
        ) : (
          <form onSubmit={handleFileUpload} className="text-center">
            <div className="border-2 border-dashed rounded-lg p-12 flex flex-col items-center">
              <FiUploadCloud size={60} className="mx-auto text-gray-400 mb-4" />
              <p className="font-semibold text-gray-700">{file ? file.name : 'Drag & drop your Excel file'}</p>
              <p className="text-sm text-gray-500 mt-1">or</p>
              <label htmlFor="file-upload" className="mt-4 cursor-pointer bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-semibold hover:bg-purple-200">Browse File</label>
              <input type="file" id="file-upload" className="sr-only" onChange={handleFileChange} accept=".xlsx, .xls, .csv" />
            </div>
            <p className="text-sm text-gray-500 mt-4">File must contain columns: name, email, password {role === 'student' && ', regNumber, supervisorEmail'}. <button type="button" onClick={handleDownloadSample} className="text-purple-600 font-semibold hover:underline">Download sample.</button></p>
            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
            <div className="flex justify-end gap-4 pt-6"><button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300">Cancel</button><button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700" disabled={isUploading}>{isUploading ? <FiLoader className="animate-spin" /> : 'Upload & Add'}</button></div>
          </form>
        )}
      </div>
    </div>
  );
};
export default UserModal 
