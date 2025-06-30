
/*
 * ===============================================================
 * FILE: src/components/tiptapEditor/InsertTab.jsx
 * ===============================================================
 */
import React from 'react';
import { FiImage, FiGrid } from 'react-icons/fi';

const InsertTab = ({ editor }) => {
  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt('Enter Image URL:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-1">
        <button onClick={addImage} className="p-2 rounded-md hover:bg-gray-200 text-gray-600 flex items-center gap-2" title="Insert Image">
          <FiImage size={18} />
          <span>Image</span>
        </button>
        <button onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} className="p-2 rounded-md hover:bg-gray-200 text-gray-600 flex items-center gap-2" title="Insert Table">
          <FiGrid size={18} />
          <span>Table</span>
        </button>
      </div>
    </div>
  );
};
export default InsertTab;
