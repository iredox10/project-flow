
import React from 'react';
import { FiMessageSquare } from 'react-icons/fi';

const RibbonButton = ({ action, icon: Icon, label, disabled }) => (
  <button onClick={action} className="p-2 rounded-md hover:bg-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed" title={label} disabled={disabled}>
    <Icon size={18} />
  </button>
);

const ReviewTab = ({ editor }) => {
  if (!editor) return null;

  const handleAddComment = () => {
    const comment = window.prompt("Enter your comment:");
    if (comment) {
      // In a real app, you would also save this comment to a database
      // The `Comment` extension requires an `onComment` callback to be handled
      // in the main editor component to manage comment state.
      editor.chain().focus().setComment(comment).run();
    }
  };

  // Disable the button if no text is selected
  const isTextSelected = !editor.state.selection.empty;

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-1">
        <button onClick={handleAddComment} disabled={!isTextSelected} className="p-2 rounded-md hover:bg-gray-200 text-gray-600 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" title="Add Comment">
          <FiMessageSquare size={18} />
          <span>Add Comment</span>
        </button>
      </div>
    </div>
  );
};

export default ReviewTab;
