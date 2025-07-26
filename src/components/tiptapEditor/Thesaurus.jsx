
import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const Thesaurus = ({ editor, onClose }) => {
  const [selectedWord, setSelectedWord] = useState('');
  const [synonyms, setSynonyms] = useState([]);

  useEffect(() => {
    const { from, to } = editor.state.selection;
    const word = editor.state.doc.textBetween(from, to);
    setSelectedWord(word);

    if (word) {
      // In a real application, you would use an API to get synonyms.
      // For this example, we'll use a mock list.
      const mockSynonyms = {
        happy: ['joyful', 'cheerful', 'merry', 'glad'],
        sad: ['unhappy', 'sorrowful', 'dejected', 'gloomy'],
        good: ['fine', 'excellent', 'great', 'superb'],
      };
      setSynonyms(mockSynonyms[word.toLowerCase()] || []);
    }
  }, [editor.state.selection]);

  const handleReplace = (synonym) => {
    const { from, to } = editor.state.selection;
    editor.chain().focus().deleteRange({ from, to }).insertContent(synonym).run();
    onClose();
  };

  return (
    <div className="absolute top-0 right-0 bg-white shadow-lg rounded-lg p-4 w-80 border z-10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Thesaurus</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
          <FiX size={20} />
        </button>
      </div>
      {selectedWord ? (
        <div>
          <p className="font-semibold mb-2">Synonyms for "{selectedWord}":</p>
          {synonyms.length > 0 ? (
            <ul>
              {synonyms.map((synonym, index) => (
                <li key={index} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => handleReplace(synonym)}>
                  {synonym}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No synonyms found.</p>
          )}
        </div>
      ) : (
        <p className="text-gray-500">Select a word to see synonyms.</p>
      )}
    </div>
  );
};

export default Thesaurus;
