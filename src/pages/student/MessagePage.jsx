
import React, { useState, useEffect, useRef } from 'react';
import StudentLayout from '../../components/StudentLayout';
import { FiSend, FiLoader, FiMessageSquare } from 'react-icons/fi';
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

const StudentMessagesPage = () => {
    const { currentUser } = useAuth();
    const [supervisor, setSupervisor] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState({ supervisor: true, messages: false });
    const messagesEndRef = useRef(null);

    // Fetch assigned supervisor
    useEffect(() => {
        if (!currentUser || !currentUser.assignedSupervisorId) {
            setLoading({ supervisor: false, messages: false });
            return;
        }
        
        const fetchSupervisor = async () => {
            const supervisorDocRef = doc(db, "users", currentUser.assignedSupervisorId);
            const supervisorDoc = await getDoc(supervisorDocRef);
            if (supervisorDoc.exists()) {
                setSupervisor({ id: supervisorDoc.id, ...supervisorDoc.data() });
            }
            setLoading(prev => ({ ...prev, supervisor: false }));
        };
        fetchSupervisor();
    }, [currentUser]);

    // Fetch messages when supervisor is loaded
    useEffect(() => {
        if (!supervisor || !currentUser) return;

        setLoading(prev => ({ ...prev, messages: true }));
        const chatId = [currentUser.uid, supervisor.id].sort().join('_');
        const messagesQuery = query(collection(db, `chats/${chatId}/messages`), orderBy("timestamp"));

        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const fetchedMessages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(fetchedMessages);
            setLoading(prev => ({ ...prev, messages: false }));
        });

        return () => unsubscribe();
    }, [supervisor, currentUser]);

    // Scroll to the bottom of the messages list
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !supervisor || !currentUser) return;

        const chatId = [currentUser.uid, supervisor.id].sort().join('_');
        const messagesRef = collection(db, `chats/${chatId}/messages`);

        await addDoc(messagesRef, {
            text: newMessage,
            senderId: currentUser.uid,
            timestamp: serverTimestamp()
        });
        setNewMessage('');
    };

    return (
        <StudentLayout>
            <div className="flex h-[calc(100vh-10rem)] bg-white rounded-xl shadow-md">
                {/* Left Panel: Supervisor Info */}
                <div className="w-1/3 border-r flex flex-col">
                    <div className="p-4 border-b">
                        <h2 className="text-xl font-bold text-gray-800">Conversation</h2>
                    </div>
                    <div className="flex-1 p-4">
                        {loading.supervisor ? <div className="p-4 text-center"><FiLoader className="animate-spin mx-auto" /></div> : (
                            supervisor ? (
                                <div className="text-center">
                                    <img src={`https://placehold.co/80x80/E0E7FF/4F46E5?text=${supervisor.name.charAt(0)}`} alt={supervisor.name} className="w-20 h-20 rounded-full mx-auto" />
                                    <p className="font-semibold text-lg text-gray-800 mt-4">{supervisor.name}</p>
                                    <p className="text-sm text-gray-500">Your Supervisor</p>
                                </div>
                            ) : (
                                <div className="text-center text-gray-500">
                                    <p>You have not been assigned a supervisor yet.</p>
                                </div>
                            )
                        )}
                    </div>
                </div>

                {/* Right Panel: Chat Window */}
                <div className="w-2/3 flex flex-col">
                    {supervisor ? (
                        <>
                            <div className="p-4 border-b">
                                <h2 className="text-xl font-bold text-gray-800">Chat with {supervisor.name}</h2>
                            </div>
                            <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
                                {loading.messages ? <div className="text-center"><FiLoader className="animate-spin mx-auto" /></div> : (
                                    <div className="space-y-4">
                                        {messages.map(msg => (
                                            <div key={msg.id} className={`flex ${msg.senderId === currentUser.uid ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-md p-3 rounded-lg ${msg.senderId === currentUser.uid ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                                    <p>{msg.text}</p>
                                                    <p className={`text-xs mt-1 ${msg.senderId === currentUser.uid ? 'text-blue-200' : 'text-gray-500'}`}>
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
                                    <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type your message..." className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
                                    <button type="submit" className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"><FiSend /></button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500">
                            <FiMessageSquare size={48} className="text-gray-300 mb-4" />
                            <p>Your conversation will appear here once you are assigned a supervisor.</p>
                        </div>
                    )}
                </div>
            </div>
        </StudentLayout>
    );
};

export default StudentMessagesPage;
