
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import TiptapEditor from '../../components/tiptapEditor/TiptapEditor';
import { FiCheck, FiArrowLeft, FiMessageSquare, FiX, FiSend, FiCheckCircle } from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';

// --- Mock Data ---
const mockProjectData = {
  id: 'proj_01',
  title: 'Advanced Cryptography Techniques',
  chapters: [{ id: 3, title: 'Chapter 3: Asymmetric-Key Algorithms' }],
  initialComments: [
    {
      id: 'comment-1', text: 'Is this the most accepted definition? Please cite a source.', author: 'Dr. Alan Turing',
      highlightedText: 'key distribution problem',
      replies: [{ author: 'Ethan Hunt', text: 'Good point, I will add a citation from the NIST publication.' }],
      isResolved: false,
    }
  ],
  initialContent: '<h1>Asymmetric-Key Algorithms</h1><p>This section covers RSA, ECC, and their mathematical underpinnings. The focus will be on how public-key cryptography solves the <mark data-comment-id="comment-1">key distribution problem</mark>.</p>'
};

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
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none transition text-sm"
        autoFocus
      />
      <button type="submit" className="p-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700" aria-label={submitLabel}>
        <FiSend size={16} />
      </button>
    </form>
  );
}

// --- Comment Card Component ---
const CommentCard = ({ comment, activeCommentId, onCardClick, addReply, deleteComment, resolveComment, onHighlightClick }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  return (
    <div id={`comment-${comment.id}`} onClick={() => onCardClick(comment.id)} className={`p-4 rounded-lg transition-all cursor-pointer ${comment.isResolved ? 'bg-gray-100 opacity-60' : 'bg-white'} ${activeCommentId === comment.id ? 'ring-2 ring-teal-500' : 'hover:bg-gray-50'}`}>
      {comment.highlightedText && (
        <blockquote onClick={() => onHighlightClick(comment.id)} className={`border-l-4 pl-3 mb-3 italic transition-colors ${comment.isResolved ? 'border-gray-300 text-gray-500' : 'border-gray-400 text-gray-600 hover:border-teal-400'}`}>
          "{comment.highlightedText}"
        </blockquote>
      )}
      <div className="flex justify-between items-center mb-2">
        <p className="font-semibold text-sm text-gray-700">{comment.author}</p>
        <div className="flex items-center gap-2">
          {!comment.isResolved && (
            <button onClick={() => resolveComment(comment.id)} className="text-gray-400 hover:text-green-500" title="Resolve Comment"><FiCheckCircle size={16} /></button>
          )}
          <button onClick={() => deleteComment(comment.id, comment.isResolved)} className="text-gray-400 hover:text-red-500" title="Delete Comment"><FiX size={16} /></button>
        </div>
      </div>
      <p className="text-gray-800">{comment.text}</p>
      {!comment.isResolved && (
        <>
          <div className="mt-3 space-y-2 pl-4 border-l-2">
            {comment.replies && comment.replies.map((reply, index) => (
              <div key={index}>
                <p className="font-semibold text-xs text-gray-600">{reply.author}</p>
                <p className="text-sm text-gray-700">{reply.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-2">
            {showReplyInput ? (
              <CommentInput onSubmit={(replyText) => { addReply(comment.id, { author: 'Dr. Alan Turing', text: replyText }); setShowReplyInput(false); }} placeholder="Write a reply..." submitLabel="Send Reply" />
            ) : (
              <button onClick={() => setShowReplyInput(true)} className="text-xs font-semibold text-teal-600 hover:underline">Reply</button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

const SupervisorChapterEditorPage = () => {
  const { projectId, chapterId } = useParams();
  const chapter = mockProjectData.chapters.find(c => c.id === parseInt(chapterId));

  const [editorKey, setEditorKey] = useState(Date.now());
  const [editorContent, setEditorContent] = useState(mockProjectData.initialContent);
  const [comments, setComments] = useState(mockProjectData.initialComments);
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [pendingCommentInfo, setPendingCommentInfo] = useState(null);

  const handleSaveChanges = () => {
    alert("Changes saved!");
    console.log({ content: editorContent, comments });
  };

  const handleStartComment = (commentId, highlightedText) => {
    setPendingCommentInfo({ id: commentId, highlightedText });
    setActiveCommentId(commentId);
  };

  const addComment = (commentText) => {
    setComments(prev => [...prev, {
      id: pendingCommentInfo.id, text: commentText, author: 'Dr. Alan Turing',
      highlightedText: pendingCommentInfo.highlightedText, replies: [], isResolved: false
    }]);
    setPendingCommentInfo(null);
  };

  const addReply = (commentId, reply) => {
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, replies: [...(c.replies || []), reply] } : c));
  };

  const resolveComment = (commentId) => {
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, isResolved: true } : c));
    const newContent = editorContent.replace(new RegExp(`<mark data-comment-id="${commentId}">([^<]+)<\/mark>`, 'g'), '$1');
    setEditorContent(newContent);
    setEditorKey(Date.now());
  };

  const deleteComment = (commentId, isResolved) => {
    setComments(prev => prev.filter(c => c.id !== commentId));
    if (!isResolved) {
      const newContent = editorContent.replace(new RegExp(`<mark data-comment-id="${commentId}">([^<]+)<\/mark>`, 'g'), '$1');
      setEditorContent(newContent);
      setEditorKey(Date.now());
    }
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

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="mb-4">
        <Link to={`/supervisor/project/${projectId}`} className="flex items-center gap-2 text-teal-600 font-semibold hover:underline"><FiArrowLeft />Back to Project</Link>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{chapter?.title}</h1>
        <button onClick={handleSaveChanges} className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700">
          <FiCheck size={20} />Save Changes
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-grow">
          <div className="bg-white rounded-xl shadow-md">
            <TiptapEditor
              key={editorKey}
              initialContent={editorContent}
              onUpdate={setEditorContent}
              onStartComment={handleStartComment}
            />
          </div>
        </div>
        <div className="w-full md:w-80 lg:w-96 flex-shrink-0">
          <div className="bg-white p-4 rounded-xl shadow-md sticky top-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Comments</h2>
            <div className="space-y-4 max-h-[75vh] overflow-y-auto">
              {pendingCommentInfo && (
                <div className="p-4 rounded-lg bg-teal-50 border border-teal-300">
                  <blockquote className="border-l-4 border-gray-300 pl-3 mb-3 text-gray-600 italic">"{pendingCommentInfo.highlightedText}"</blockquote>
                  <CommentInput onSubmit={addComment} placeholder="Add your comment..." submitLabel="Add Comment" />
                </div>
              )}
              {comments.map(comment => (
                <CommentCard
                  key={comment.id} comment={comment} activeCommentId={activeCommentId}
                  onCardClick={setActiveCommentId} addReply={addReply}
                  deleteComment={deleteComment} resolveComment={resolveComment}
                  onHighlightClick={handleHighlightClick}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorChapterEditorPage;
