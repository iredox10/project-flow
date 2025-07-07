
import React, { useState, useEffect, useMemo, useRef } from 'react';
import SupervisorLayout from '../../components/SupervisorLayout';
import { FiSearch, FiSend, FiLoader } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import {
    db,
    collection,
    query,
    where,
    onSnapshot,
    addDoc,
    serverTimestamp,
    orderBy,
    doc,
    getDoc
} from '../../firebase/config';
import { format } from 'date-fns';

const MessagesPage = () => {
    const { currentUser } = useAuth();
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState({ students: true, messages: false });
    const messagesEndRef = useRef(null);

    // Fetch students assigned to the current supervisor
    useEffect(() => {
        if (!currentUser) return;
        const studentsQuery = query(collection(db, "users"), where("role", "==", "student"), where("assignedSupervisorId", "==", currentUser.uid));
        
        const unsubscribe = onSnapshot(studentsQuery, (snapshot) => {
            const fetchedStudents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setStudents(fetchedStudents);
            setLoading(prev => ({ ...prev, students: false }));
        });

        return () => unsubscribe();
    }, [currentUser]);

    // Fetch messages when a student is selected
    useEffect(() => {
        if (!selectedStudent || !currentUser) return;

        setLoading(prev => ({ ...prev, messages: true }));
        const chatId = [currentUser.uid, selectedStudent.id].sort().join('_');
        const messagesQuery = query(collection(db, `chats/${chatId}/messages`), orderBy("timestamp"));

        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const fetchedMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(fetchedMessages);
            setLoading(prev => ({ ...prev, messages: false }));
        });

        return () => unsubscribe();
    }, [selectedStudent, currentUser]);

    // Scroll to the bottom of the messages list
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedStudent || !currentUser) return;

        const chatId = [currentUser.uid, selectedStudent.id].sort().join('_');
        const messagesRef = collection(db, `chats/${chatId}/messages`);

        await addDoc(messagesRef, {
            text: newMessage,
            senderId: currentUser.uid,
            timestamp: serverTimestamp()
        });
        setNewMessage('');
    };

    return (
        <SupervisorLayout>
            <div className="flex h-[calc(100vh-10rem)] bg-white rounded-xl shadow-md">
                {/* Left Panel: Student List */}
                <div className="w-1/3 border-r flex flex-col">
                    <div className="p-4 border-b">
                        <h2 className="text-xl font-bold text-gray-800">Conversations</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {loading.students ? <div className="p-4 text-center"><FiLoader className="animate-spin mx-auto" /></div> : (
                            students.map(student => (
                                <button key={student.id} onClick={() => setSelectedStudent(student)} className={`w-full text-left p-4 border-b flex items-center gap-4 transition-colors ${selectedStudent?.id === student.id ? 'bg-teal-50' : 'hover:bg-gray-50'}`}>
                                    <img src={`https://placehold.co/40x40/99E6E6/134E4A?text=${student.name.charAt(0)}`} alt={student.name} className="w-10 h-10 rounded-full" />
                                    <div>
                                        <p className="font-semibold text-gray-800">{student.name}</p>
                                        <p className="text-sm text-gray-500">{student.regNumber || 'No Reg. Number'}</p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Right Panel: Chat Window */}
                <div className="w-2/3 flex flex-col">
                    {selectedStudent ? (
                        <>
                            <div className="p-4 border-b flex items-center gap-4">
                                <img src={`https://placehold.co/40x40/99E6E6/134E4A?text=${selectedStudent.name.charAt(0)}`} alt={selectedStudent.name} className="w-10 h-10 rounded-full" />
                                <h2 className="text-xl font-bold text-gray-800">{selectedStudent.name}</h2>
                            </div>
                            <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
                                {loading.messages ? <div className="text-center"><FiLoader className="animate-spin mx-auto" /></div> : (
                                    <div className="space-y-4">
                                        {messages.map(msg => (
                                            <div key={msg.id} className={`flex ${msg.senderId === currentUser.uid ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-md p-3 rounded-lg ${msg.senderId === currentUser.uid ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                                    <p>{msg.text}</p>
                                                    <p className={`text-xs mt-1 ${msg.senderId === currentUser.uid ? 'text-teal-200' : 'text-gray-500'}`}>
                                                        {msg.timestamp ? format(msg.timestamp.toDate(), 'p') : 'Sending...'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>
                                )}
                            </div>
                            <div className="p-4 border-t bg-white">
                                <form onSubmit={handleSendMessage} className="flex items-center gap-4">
                                    <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type your message..." className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500" />
                                    <button type="submit" className="p-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700"><FiSend /></button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-center text-gray-500">
                            <p>Select a student to start a conversation.</p>
                        </div>
                    )}
                </div>
            </div>
        </SupervisorLayout>
    );
};

export default MessagesPage;
