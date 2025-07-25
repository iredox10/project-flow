
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import TiptapEditor from '../../components/tiptapEditor/TiptapEditor';
import  NotificationModal  from '../../components/NotificationModal';
import { FiCheck, FiArrowLeft, FiSend, FiLoader, FiX, FiDownload, FiSearch, FiClock } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { 
    db, 
    doc, 
    onSnapshot, 
    updateDoc, 
    arrayUnion, 
    serverTimestamp,
    query,
    collection,
    where,
    orderBy,
    addDoc
} from '../../firebase/config';
import { limit } from 'firebase/firestore';
import { debounce } from 'lodash';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import VersionHistory from '../../components/VersionHistory';

// --- Comment Input Form Component ---
const CommentInput = ({ onSubmit, placeholder, submitLabel, isSubmitting }) => {
    const [text, setText] = useState('');
    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim() && !isSubmitting) {
            onSubmit(text);
            setText('');
        }
    };
    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2">
            <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-sm" autoFocus />
            <button type="submit" className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center w-10 h-10" aria-label={submitLabel} disabled={isSubmitting}>
                {isSubmitting ? <FiLoader className="animate-spin" /> : <FiSend size={16} />}
            </button>
        </form>
    );
}

// --- Comment Card Component ---
const CommentCard = ({ comment, activeCommentId, onCardClick, addReply, onHighlightClick, showNotification }) => {
    const [showReplyInput, setShowReplyInput] = useState(false);
    const [isReplying, setIsReplying] = useState(false);

    const handleReplySubmit = async (replyText) => {
        setIsReplying(true);
        try {
            await addReply(comment.id, replyText);
            setShowReplyInput(false);
        } catch (error) {
            console.error("Failed to add reply:", error);
            showNotification('Error', 'Could not send reply. Please try again.', 'error');
        } finally {
            setIsReplying(false);
        }
    };

    return (
        <div id={`comment-${comment.id}`} onClick={() => onCardClick(comment.id)} className={`p-4 rounded-lg transition-all cursor-pointer ${comment.isResolved ? 'bg-gray-100 opacity-60' : 'bg-white'} ${activeCommentId === comment.id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'}`}>
            {comment.highlightedText && (
                <blockquote onClick={() => onHighlightClick(comment.id)} className={`border-l-4 pl-3 mb-3 italic transition-colors ${comment.isResolved ? 'border-gray-300 text-gray-500' : 'border-gray-400 text-gray-600 hover:border-blue-400'}`}>
                    "{comment.highlightedText}"
                </blockquote>
            )}
            <p className="font-semibold text-sm text-gray-700 mb-1">{comment.authorName}</p>
            <p className="text-gray-800">{comment.text}</p>
            {!comment.isResolved && (
                <>
                    <div className="mt-3 space-y-2 pl-4 border-l-2">
                        {comment.replies && comment.replies.map((reply, index) => (
                            <div key={index}>
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-xs text-gray-600">{reply.authorName}</p>
                                    <p className="text-xs text-gray-400">
                                        {reply.createdAt?.toDate ? format(reply.createdAt.toDate(), 'MMM d, p') : ''}
                                    </p>
                                </div>
                                <p className="text-sm text-gray-700">{reply.text}</p>
                            </div>
                        ))}
                    </div>
                    <div className="mt-2">
                        {showReplyInput ? (
                            <CommentInput onSubmit={handleReplySubmit} placeholder="Write your reply..." submitLabel="Send Reply" isSubmitting={isReplying} />
                        ) : (
                            <button onClick={() => setShowReplyInput(true)} className="text-xs font-semibold text-blue-600 hover:underline">Reply</button>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

const StudentChapterEditorPage = () => {
    const { projectId, chapterId } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const [chapter, setChapter] = useState(null);
    const [comments, setComments] = useState([]);
    const [editorContent, setEditorContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCheckingPlagiarism, setIsCheckingPlagiarism] = useState(false);
    const [activeCommentId, setActiveCommentId] = useState(null);
    const [notification, setNotification] = useState({ isOpen: false, title: '', message: '', type: 'success' });
    const [showVersionHistory, setShowVersionHistory] = useState(false);
    const [versions, setVersions] = useState([]);
    const editorRef = useRef(null);

    const saveContent = useCallback(
        debounce(async (content) => {
            if (chapterId) {
                const chapterRef = doc(db, "chapters", chapterId);
                // First, update the main chapter content
                await updateDoc(chapterRef, { content });

                // Then, add a new version to the subcollection
                const versionsCollectionRef = collection(db, "chapters", chapterId, "versions");
                await addDoc(versionsCollectionRef, {
                    content,
                    timestamp: serverTimestamp()
                });
                showNotification('Success', 'Changes saved automatically.', 'success');
            }
        }, 2000), // Increased debounce time
        [chapterId]
    );

    useEffect(() => {
        if (!chapterId) return;

        const chapterRef = doc(db, "chapters", chapterId);
        const unsubChapter = onSnapshot(chapterRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                setChapter({ id: doc.id, ...data });
                // Only set editor content from Firestore on initial load
                if (editorRef.current === null) {
                    const initialContent = data.content || `<h1>${data.title}</h1><p>Start writing here...</p>`;
                    setEditorContent(initialContent);
                    editorRef.current = initialContent;
                }
            }
            setLoading(false);
        });

        const commentsQuery = query(collection(db, "comments"), where("chapterId", "==", chapterId), orderBy("createdAt"));
        const unsubComments = onSnapshot(commentsQuery, (snapshot) => {
            const fetchedComments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setComments(fetchedComments);
        });

        const versionsQuery = query(collection(db, "chapters", chapterId, "versions"), orderBy("timestamp", "desc"), limit(20));
        const unsubVersions = onSnapshot(versionsQuery, (snapshot) => {
            const fetchedVersions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setVersions(fetchedVersions);
        });

        return () => {
            unsubChapter();
            unsubComments();
            unsubVersions();
        };
    }, [chapterId]);

    const showNotification = (title, message, type = 'success') => {
        setNotification({ isOpen: true, title, message, type });
    };

    const handleEditorUpdate = (content) => {
        setEditorContent(content);
        saveContent(content);
    };

    const handleRestoreVersion = async (versionContent) => {
        // Update the editor's content
        setEditorContent(versionContent);
        
        // Manually trigger an update in the editor component if it doesn't automatically
        // This might require a method passed down to TiptapEditor to force-set its content
        
        // Update the database
        if (chapterId) {
            const chapterRef = doc(db, "chapters", chapterId);
            await updateDoc(chapterRef, { content: versionContent });
        }
        
        setShowVersionHistory(false);
        showNotification('Success', 'Content has been restored to the selected version.', 'success');
    };

    const addReply = async (commentId, replyText) => {
        if (!currentUser) throw new Error("User not authenticated");
        const commentRef = doc(db, "comments", commentId);
        await updateDoc(commentRef, {
            replies: arrayUnion({
                authorId: currentUser.uid,
                authorName: currentUser.name,
                text: replyText,
                createdAt: new Date() 
            })
        });
    };
    
    const handleHighlightClick = (commentId) => {
        const editorElement = document.querySelector('.ProseMirror');
        if (editorElement) {
            const highlight = editorElement.querySelector(`mark[data-comment-id="${commentId}"]`);
            if (highlight) {
                highlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    };

    const handleSubmitForReview = async () => {
        setIsSubmitting(true);
        const chapterRef = doc(db, "chapters", chapterId);
        await updateDoc(chapterRef, {
            status: 'reviewing',
            dateSubmitted: serverTimestamp()
        });
        setIsSubmitting(false);
        showNotification("Success!", "Your chapter has been submitted successfully for review.");
        setTimeout(() => navigate('/student/my-project'), 2000);
    };

    const handleExportToPDF = () => {
        const editorContentElement = document.querySelector('.ProseMirror');
        if (editorContentElement) {
            html2canvas(editorContentElement).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF();
                const imgProps= pdf.getImageProperties(imgData);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`${chapter?.title || 'chapter'}.pdf`);
            });
        }
    };

    const handlePlagiarismCheck = async () => {
        setIsCheckingPlagiarism(true);
        showNotification('Info', 'Checking for plagiarism... This may take a moment.', 'info');

        const simulatePlagiarismAPI = new Promise(resolve => {
            setTimeout(() => {
                const randomScore = Math.floor(Math.random() * 15) + 1;
                resolve({ plagiarismScore: randomScore });
            }, 3000);
        });

        try {
            const result = await simulatePlagiarismAPI;
            showNotification(
                'Plagiarism Check Complete',
                `The simulated plagiarism score is ${result.plagiarismScore}%.`,
                'success'
            );
        } catch (error) {
            showNotification('Error', 'Failed to check for plagiarism. Please try again.', 'error');
        } finally {
            setIsCheckingPlagiarism(false);
        }
    };

    if (loading) {
        return <div className="flex h-screen items-center justify-center"><FiLoader className="animate-spin text-blue-500" size={48} /></div>;
    }

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            {showVersionHistory && (
                <VersionHistory 
                    versions={versions}
                    onClose={() => setShowVersionHistory(false)}
                    onSelectVersion={handleRestoreVersion}
                />
            )}
            <NotificationModal 
                isOpen={notification.isOpen} 
                onClose={() => setNotification({ ...notification, isOpen: false })}
                title={notification.title}
                message={notification.message}
                type={notification.type}
            />
            <div className="flex justify-between items-center mb-8">
                <div>
                    <Link to="/student/my-project" className="flex items-center gap-2 text-blue-600 font-semibold hover:underline mb-2">
                        <FiArrowLeft />
                        Back to Project Overview
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">{chapter?.title}</h1>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => setShowVersionHistory(true)} className="inline-flex items-center gap-2 bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-500">
                        <FiClock size={20} />
                        History
                    </button>
                    <button onClick={handlePlagiarismCheck} className="inline-flex items-center gap-2 bg-yellow-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600" disabled={isCheckingPlagiarism}>
                        {isCheckingPlagiarism ? <FiLoader className="animate-spin" /> : <FiSearch size={20} />}
                        Check Plagiarism
                    </button>
                    <button onClick={handleExportToPDF} className="inline-flex items-center gap-2 bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600">
                        <FiDownload size={20} />
                        Export as PDF
                    </button>
                    <button onClick={handleSubmitForReview} className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700" disabled={isSubmitting}>
                        {isSubmitting ? <FiLoader className="animate-spin" /> : <FiCheck size={20} />}
                        Submit for Review
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-grow">
                    <div className="bg-white rounded-xl shadow-md">
                        <TiptapEditor 
                            key={editorContent} // Force re-render when content changes
                            initialContent={editorContent}
                            onUpdate={handleEditorUpdate}
                            onStartComment={() => {}} // Students cannot create new comments
                        />
                    </div>
                </div>

                <div className="w-full md:w-80 lg:w-96 flex-shrink-0">
                    <div className="bg-white p-4 rounded-xl shadow-md sticky top-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Supervisor's Comments</h2>
                        <div className="space-y-4 max-h-[75vh] overflow-y-auto">
                           {comments.length > 0 ? comments.map(comment => (
                                <CommentCard 
                                    key={comment.id} 
                                    comment={comment} 
                                    activeCommentId={activeCommentId} 
                                    onCardClick={setActiveCommentId} 
                                    addReply={addReply}
                                    onHighlightClick={handleHighlightClick}
                                    showNotification={showNotification}
                                />
                            )) : <p className="text-gray-500 text-center py-4">No comments from your supervisor yet.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentChapterEditorPage;
