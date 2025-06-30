
import React, { useState, useEffect } from 'react';
import HomeTab from './HomeTab';
import InsertTab from './InsertTab';
import TableTab from './TableTab';
import ReviewTab from './ReviewTab';

const Ribbon = ({ editor }) => {
  const [activeTab, setActiveTab] = useState('home');

  // This effect ensures that if the user clicks inside a table,
  // the ribbon automatically switches to the "Table" tab for convenience.
  useEffect(() => {
    const handleUpdate = () => {
      if (editor.isActive('table')) {
        setActiveTab('table');
      }
    };

    editor.on('selectionUpdate', handleUpdate);

    // Cleanup the event listener when the component is unmounted
    return () => {
      editor.off('selectionUpdate', handleUpdate);
    };
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-gray-300 bg-white rounded-t-lg">
      {/* Tab Buttons */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('home')}
          className={`py-2 px-4 font-semibold text-sm ${activeTab === 'home' ? 'bg-gray-100 text-teal-700' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          Home
        </button>
        <button
          onClick={() => setActiveTab('insert')}
          className={`py-2 px-4 font-semibold text-sm ${activeTab === 'insert' ? 'bg-gray-100 text-teal-700' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          Insert
        </button>
        <button
          onClick={() => setActiveTab('review')}
          className={`py-2 px-4 font-semibold text-sm ${activeTab === 'review' ? 'bg-gray-100 text-teal-700' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          Review
        </button>
        {/* The Table tab only appears when the cursor is inside a table */}
        {editor.isActive('table') && (
          <button
            onClick={() => setActiveTab('table')}
            className={`py-2 px-4 font-semibold text-sm ${activeTab === 'table' ? 'bg-gray-100 text-teal-700' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Table
          </button>
        )}
      </div>
      {/* Tab Content */}
      <div className="p-2 min-h-[48px]">
        {activeTab === 'home' && <HomeTab editor={editor} />}
        {activeTab === 'insert' && <InsertTab editor={editor} />}
        {activeTab === 'review' && <ReviewTab editor={editor} />}
        {activeTab === 'table' && <TableTab editor={editor} />}
      </div>
    </div>
  );
};

export default Ribbon;
