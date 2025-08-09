
import React, { useState, useEffect } from 'react';
import HomeTab from './HomeTab';
import InsertTab from './InsertTab';
import TableTab from './TableTab';
import ReviewTab from './ReviewTab';
import PageLayout from './PageLayout';
import ReferencesTab from './ReferencesTab';

const Ribbon = ({ editor, setShowCitationModal, setShowBibliography, showBibliography, setIsSuggesting, isSuggesting }) => {
  const [activeTab, setActiveTab] = useState('home');

  useEffect(() => {
    const handleUpdate = () => {
      if (editor.isActive('table')) {
        setActiveTab('table');
      }
    };

    editor.on('selectionUpdate', handleUpdate);

    return () => {
      editor.off('selectionUpdate', handleUpdate);
    };
  }, [editor]);

  if (!editor) return null;

  const tabStyles = "py-1 px-4 font-semibold text-sm focus:outline-none";
  const inactiveTabStyles = "text-gray-600 hover:bg-gray-100";
  const activeTabStyles = "bg-white text-blue-600 border-b-2 border-blue-600";

  return (
    <div className="bg-[#F3F3F3] border-b-2 border-gray-300">
      {/* Tab Buttons */}
      <div className="flex items-center px-4">
        <button
          onClick={() => setActiveTab('file')}
          className={`${tabStyles} ${activeTab === 'file' ? 'bg-blue-600 text-white' : 'bg-transparent text-gray-800 hover:bg-blue-100'}`}
        >
          File
        </button>
        <div className="flex border-b-0">
          <button
            onClick={() => setActiveTab('home')}
            className={`${tabStyles} ${activeTab === 'home' ? activeTabStyles : inactiveTabStyles}`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('insert')}
            className={`${tabStyles} ${activeTab === 'insert' ? activeTabStyles : inactiveTabStyles}`}
          >
            Insert
          </button>
          <button
            onClick={() => setActiveTab('layout')}
            className={`${tabStyles} ${activeTab === 'layout' ? activeTabStyles : inactiveTabStyles}`}
          >
            Layout
          </button>
          <button
            onClick={() => setActiveTab('references')}
            className={`${tabStyles} ${activeTab === 'references' ? activeTabStyles : inactiveTabStyles}`}
          >
            References
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`${tabStyles} ${activeTab === 'review' ? activeTabStyles : inactiveTabStyles}`}
          >
            Review
          </button>
          {editor.isActive('table') && (
            <button
              onClick={() => setActiveTab('table')}
              className={`${tabStyles} ${activeTab === 'table' ? activeTabStyles : inactiveTabStyles}`}
            >
              Table
            </button>
          )}
        </div>
      </div>
      {/* Tab Content */}
      <div className="p-1 bg-white min-h-[60px]">
        {activeTab === 'home' && <HomeTab editor={editor} />}
        {activeTab === 'insert' && <InsertTab editor={editor} setShowCitationModal={setShowCitationModal} />}
        {activeTab === 'layout' && <PageLayout editor={editor} />}
        {activeTab === 'references' && <ReferencesTab editor={editor} setShowBibliography={setShowBibliography} showBibliography={showBibliography} />}
        {activeTab === 'review' && <ReviewTab editor={editor} setIsSuggesting={setIsSuggesting} isSuggesting={isSuggesting} />}
        {activeTab === 'table' && <TableTab editor={editor} />}
        {activeTab === 'file' && <div>File Content Goes Here</div>}
      </div>
    </div>
  );
};

export default Ribbon;
