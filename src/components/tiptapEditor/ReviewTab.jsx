
import React, { useState } from 'react';
import { FiCheckSquare, FiBookOpen, FiEdit } from 'react-icons/fi';
import SpellCheck from './SpellCheck';
import Thesaurus from './Thesaurus';

const RibbonButton = ({ action, icon: Icon, label }) => (
    <button
      onClick={action}
      className={`p-1 rounded hover:bg-gray-200 flex flex-col items-center justify-center w-20 h-20 text-gray-700'}`}
      title={label}
    >
      <Icon size={24} />
      <span className="text-xs mt-1">{label}</span>
    </button>
  );

const ReviewTab = ({ editor, setIsSuggesting, isSuggesting }) => {
  const [isSpellCheckVisible, setSpellCheckVisible] = useState(false);
  const [isThesaurusVisible, setThesaurusVisible] = useState(false);

  return (
    <div className="flex items-start gap-4 p-2">
        <div className="flex flex-col items-center">
            <RibbonButton action={() => setSpellCheckVisible(true)} icon={FiCheckSquare} label="Spelling & Grammar" />
            <span className="text-xs mt-1 text-gray-500">Proofing</span>
        </div>
        <div className="flex flex-col items-center">
            <RibbonButton action={() => setThesaurusVisible(true)} icon={FiBookOpen} label="Thesaurus" />
            <span className="text-xs mt-1 text-gray-500">Language</span>
        </div>

        {/* Track Changes Group */}
        <div className="flex flex-col items-center">
            <RibbonButton 
                action={() => {
                    setIsSuggesting(!isSuggesting);
                    editor.commands.toggleSuggesting();
                }}
                icon={FiEdit} 
                label="Track Changes" 
                name="trackChanges" 
                className={isSuggesting ? 'bg-blue-200' : ''} // Highlight if active
            />
            <span className="text-xs mt-1 text-gray-500">Review</span>
        </div>
        {isSpellCheckVisible && <SpellCheck editor={editor} onClose={() => setSpellCheckVisible(false)} />}
        {isThesaurusVisible && <Thesaurus editor={editor} onClose={() => setThesaurusVisible(false)} />}
    </div>
  );
};

export default ReviewTab;

