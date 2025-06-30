
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import TiptapEditor from '../../components/tiptapEditor/TiptapEditor';
import { FiCheck, FiArrowLeft, FiSend, FiX } from 'react-icons/fi';
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
      <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition text-sm" autoFocus />
      <button type="submit" className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700" aria-label={submitLabel}><FiSend size={16} /></button>
    </form>
  );
}

// --- Comment Card Component ---
const CommentCard = ({ comment, activeCommentId, onCardClick, addReply, onHighlightClick }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  return (
    <div id={`comment-${comment.id}`} onClick={() => onCardClick(comment.id)} className={`p-4 rounded-lg transition-all ${activeCommentId === comment.id ? 'ring-2 ring-blue-500' : 'bg-gray-50 hover:bg-gray-100'}`}>
      {comment.highlightedText && (
        <blockquote
          onClick={() => onHighlightClick(comment.id)}
          className="border-l-4 pl-3 mb-3 text-gray-600 italic cursor-pointer hover:border-blue-400"
        >
          "{comment.highlightedText}"
        </blockquote>
      )}
      <p className="font-semibold text-sm text-gray-700 mb-1">{comment.author}</p>
      <p className="text-gray-800">{comment.text}</p>
      {/* Replies Section */}
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
          <CommentInput onSubmit={(replyText) => { addReply(comment.id, { author: 'Ethan Hunt', text: replyText }); setShowReplyInput(false); }} placeholder="Write your reply..." submitLabel="Send Reply" />
        ) : (
          <button onClick={() => setShowReplyInput(true)} className="text-xs font-semibold text-blue-600 hover:underline">Reply</button>
        )}
      </div>
    </div>
  )
}

const StudentChapterEditorPage = () => {
  const { projectId, chapterId } = useParams();
  const chapter = mockProjectData.chapters.find(c => c.id === parseInt(chapterId));

  const [editorContent, setEditorContent] = useState(mockProjectData.initialContent);
  const [comments, setComments] = useState(mockProjectData.initialComments);
  const [activeCommentId, setActiveCommentId] = useState(null);

  const addReply = (commentId, reply) => {
    setComments(prev => prev.map(c => c.id === commentId ? { ...c, replies: [...(c.replies || []), reply] } : c));
  };

  const handleHighlightClick = (commentId) => {
    // Find the corresponding mark in the editor
    const editorElement = document.querySelector('.ProseMirror');
    if (editorElement) {
      const highlight = editorElement.querySelector(`mark[data-comment-id="${commentId}"]`);
      if (highlight) {
        // Scroll the editor to the highlighted text
        highlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="mb-4">
        <Link to={`/student/my-project`} className="flex items-center gap-2 text-blue-600 font-semibold hover:underline">
          <FiArrowLeft />
          Back to Project Overview
        </Link>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{chapter?.title}</h1>
        <button className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700">
          <FiCheck size={20} />
          Submit for Review
        </button>
      </div>


      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-grow">
          <div className="bg-white rounded-xl shadow-md">
            <TiptapEditor
              initialContent={editorContent}
              onUpdate={setEditorContent}
              onStartComment={() => { }} // Student cannot create new comments
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
