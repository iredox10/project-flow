
import React, { useState, useEffect, useMemo } from 'react';
import AdminLayout from '../components/AdminLayout';
import NotificationModal from '../components/NotificationModal';
import { FiLink, FiCheck, FiUser, FiSearch, FiUsers, FiLoader, FiUserCheck } from 'react-icons/fi';
import {
  db,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc
} from '../firebase/config';

const AssignSupervisorPage = () => {
  const [students, setStudents] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSupervisorId, setSelectedSupervisorId] = useState(null);
  const [supervisorSearch, setSupervisorSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [notification, setNotification] = useState({ isOpen: false, title: '', message: '' });

  // Fetch all students and supervisors from Firestore
  useEffect(() => {
    const usersQuery = query(collection(db, "users"), where("role", "in", ["student", "supervisor"]));

    const unsubscribe = onSnapshot(usersQuery, (querySnapshot) => {
      const fetchedUsers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(fetchedUsers.filter(u => u.role === 'student'));
      setSupervisors(fetchedUsers.filter(u => u.role === 'supervisor'));
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  const showNotification = (title, message) => {
    setNotification({ isOpen: true, title, message, type: 'success' });
  };

  const handleAssign = async (studentId, supervisorId) => {
    if (!studentId || !supervisorId) return;
    const studentRef = doc(db, "users", studentId);
    await updateDoc(studentRef, {
      assignedSupervisorId: supervisorId
    });
    showNotification('Success!', 'Supervisor has been assigned successfully.');
  };

  const handleUnassign = async (studentId) => {
    const studentRef = doc(db, "users", studentId);
    await updateDoc(studentRef, {
      assignedSupervisorId: null
    });
    showNotification('Success!', 'Supervisor has been unassigned.');
  };

  const filteredSupervisors = useMemo(() =>
    supervisors.filter(sup => sup.name.toLowerCase().includes(supervisorSearch.toLowerCase())),
    [supervisors, supervisorSearch]
  );

  const { assignedStudents, unassignedStudents } = useMemo(() => {
    const assigned = students
      .filter(s => s.assignedSupervisorId === selectedSupervisorId)
      .filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()));

    const unassigned = students
      .filter(s => !s.assignedSupervisorId)
      .filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase()));

    return { assignedStudents: assigned, unassignedStudents: unassigned };
  }, [selectedSupervisorId, students, studentSearch]);

  const selectedSupervisor = supervisors.find(s => s.id === selectedSupervisorId);

  return (
    <AdminLayout>
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        title={notification.title}
        message={notification.message}
      />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Assign Supervisors</h1>
      <p className="text-gray-600 mb-8">Select a supervisor from the left panel to manage their students.</p>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Panel: Supervisors */}
        <div className="w-full md:w-1/3 bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Supervisors</h2>
          <div className="relative mb-4">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder="Search supervisors..." onChange={(e) => setSupervisorSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
          </div>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {loading ? <FiLoader className="animate-spin mx-auto mt-8" /> : filteredSupervisors.map(supervisor => {
              const studentCount = students.filter(s => s.assignedSupervisorId === supervisor.id).length;
              return (
                <button key={supervisor.id} onClick={() => setSelectedSupervisorId(supervisor.id)} className={`w-full text-left p-4 rounded-lg flex justify-between items-center transition-colors ${selectedSupervisorId === supervisor.id ? 'bg-purple-600 text-white' : 'hover:bg-gray-100'}`}>
                  <div>
                    <p className="font-semibold">{supervisor.name}</p>
                    <p className={`text-sm ${selectedSupervisorId === supervisor.id ? 'text-purple-200' : 'text-gray-500'}`}>{studentCount} students</p>
                  </div>
                  <FiUserCheck size={20} />
                </button>
              )
            })}
          </div>
        </div>

        {/* Right Panel: Students */}
        <div className="w-full md:w-2/3">
          {selectedSupervisorId ? (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">Managing: <span className="text-purple-600">{selectedSupervisor.name}</span></h2>
              <div className="relative mb-4">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input type="text" placeholder="Search for a student to assign..." onChange={(e) => setStudentSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" />
              </div>

              {/* Assigned Students */}
              <div className="bg-white p-6 rounded-xl shadow-md mb-6">
                <h3 className="font-semibold text-lg mb-3">Assigned Students ({assignedStudents.length})</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {assignedStudents.length > 0 ? assignedStudents.map(student => (
                    <div key={student.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span>{student.name} ({student.regNumber || 'N/A'})</span>
                      <button onClick={() => handleUnassign(student.id)} className="text-red-500 hover:text-red-700 font-semibold">Unassign</button>
                    </div>
                  )) : <p className="text-gray-500 text-center py-4">No students assigned yet.</p>}
                </div>
              </div>

              {/* Unassigned Students */}
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="font-semibold text-lg mb-3">Unassigned Students ({unassignedStudents.length})</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {unassignedStudents.length > 0 ? unassignedStudents.map(student => (
                    <div key={student.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span>{student.name} ({student.regNumber || 'N/A'})</span>
                      <button onClick={() => handleAssign(student.id, selectedSupervisorId)} className="text-green-600 hover:text-green-800 font-semibold">Assign</button>
                    </div>
                  )) : <p className="text-gray-500 text-center py-4">No unassigned students available.</p>}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white p-12 rounded-xl shadow-md text-center flex flex-col items-center justify-center h-full">
              <FiUsers size={60} className="text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-700">Select a Supervisor</h3>
              <p className="text-gray-500 max-w-sm mx-auto mt-2">Choose a supervisor from the list on the left to view their assigned students and assign new ones.</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AssignSupervisorPage;
