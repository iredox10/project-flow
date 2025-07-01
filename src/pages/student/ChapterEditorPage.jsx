
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import TiptapEditor from '../../components/tiptapEditor/TiptapEditor';
import NotificationModal from '../../components/NotificationModal';
import { FiCheck, FiArrowLeft, FiSend, FiLoader } from 'react-icons/fi';
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
  where
} from '../../firebase/config';
import { debounce } from 'lodash';

// --- Comment Input Form Component ---
const CommentInput = ({ onSubmit, placeholder, submitLabel }) => {
  const [text, setText] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text);
      setText('');
    }
  };
  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2">
      <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-sm" autoFocus />
      <button type="submit" className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700" aria-label={submitLabel}><FiSend size={16} /></button>
    </form>
  );
}

// --- Comment Card Component ---
const CommentCard = ({ comment, activeCommentId, onCardClick, addReply, onHighlightClick }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
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
                <p className="font-semibold text-xs text-gray-600">{reply.authorName}</p>
                <p className="text-sm text-gray-700">{reply.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-2">
            {showReplyInput ? (
              <CommentInput onSubmit={(replyText) => { addReply(comment.id, replyText); setShowReplyInput(false); }} placeholder="Write your reply..." submitLabel="Send Reply" />
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
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [notification, setNotification] = useState({ isOpen: false, title: '', message: '' });

  // Debounced function to save editor content to Firestore
  const saveContent = useCallback(
    debounce(async (content) => {
      if (chapterId) {
        const chapterRef = doc(db, "chapters", chapterId);
        await updateDoc(chapterRef, { content });
      }
    }, 1000), // Save 1 second after user stops typing
    [chapterId]
  );

  useEffect(() => {
    if (!chapterId) return;

    // Fetch chapter data
    const chapterRef = doc(db, "chapters", chapterId);
    const unsubChapter = onSnapshot(chapterRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setChapter({ id: doc.id, ...data });
        setEditorContent(data.content || '');
      } else {
        console.error("Chapter not found!");
      }
      setLoading(false);
    });

    // Fetch comments for the chapter
    const commentsQuery = query(collection(db, "comments"), where("chapterId", "==", chapterId));
    const unsubComments = onSnapshot(commentsQuery, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComments(fetchedComments);
    });

    return () => {
      unsubChapter();
      unsubComments();
    };
  }, [chapterId]);

  const showNotification = (title, message) => {
    setNotification({ isOpen: true, title, message, type: 'success' });
  };

  const handleEditorUpdate = (content) => {
    setEditorContent(content);
    saveContent(content);
  };

  const addReply = async (commentId, replyText) => {
    if (!currentUser) return;
    const commentRef = doc(db, "comments", commentId);
    await updateDoc(commentRef, {
      replies: arrayUnion({
        authorId: currentUser.uid,
        authorName: currentUser.name,
        text: replyText,
        createdAt: serverTimestamp()
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
    // Redirect after a short delay to allow user to see the notification
    setTimeout(() => navigate('/student/my-project'), 2000);
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><FiLoader className="animate-spin text-blue-500" size={48} /></div>;
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        title={notification.title}
        message={notification.message}
      />
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link to={`/student/my-project`} className="flex items-center gap-2 text-blue-600 font-semibold hover:underline mb-2">
            <FiArrowLeft />
            Back to Project Overview
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{chapter?.title}</h1>
        </div>
        <button onClick={handleSubmitForReview} className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700" disabled={isSubmitting}>
          {isSubmitting ? <FiLoader className="animate-spin" /> : <FiCheck size={20} />}
          Submit for Review
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-grow">
          <div className="bg-white rounded-xl shadow-md">
            <TiptapEditor
              initialContent={editorContent}
              onUpdate={handleEditorUpdate}
              onStartComment={() => { }} // Students cannot create new comments, only reply
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
