
import React, { useState, useEffect } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';

const SpellCheck = ({ editor, onClose }) => {
  const [mistakes, setMistakes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // This is a mock spell check function.
    // In a real application, you would integrate a library like `languagetool-js`.
    const checkSpelling = () => {
      const text = editor.getText();
      const words = text.split(/\s+/);
      const newMistakes = [];
      words.forEach(word => {
        if (word.length > 5) { // Mock condition for a mistake
          newMistakes.push(word);
        }
      });
      setMistakes(newMistakes);
    };

    checkSpelling();
  }, [editor]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % mistakes.length);
  };

  const handleIgnore = () => {
    setMistakes(mistakes.filter((_, i) => i !== currentIndex));
    if (currentIndex >= mistakes.length - 1) {
      setCurrentIndex(0);
    }
  };

  const handleCorrect = () => {
    // In a real implementation, you would offer suggestions.
    const correction = prompt(`Correct "${mistakes[currentIndex]}" to:`);
    if (correction) {
      const { from, to } = editor.state.selection;
      editor.chain().focus().deleteRange({ from, to }).insertContent(correction).run();
      handleIgnore(); // Remove from mistakes list
    }
  };

  if (mistakes.length === 0) {
    return (
      <div className="absolute top-0 right-0 bg-white shadow-lg rounded-lg p-4 w-80 border z-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Spelling & Grammar</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <FiX size={20} />
          </button>
        </div>
        <p className="text-gray-600">No mistakes found.</p>
      </div>
    );
  }

  return (
    <div className="absolute top-0 right-0 bg-white shadow-lg rounded-lg p-4 w-80 border z-10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Spelling & Grammar</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
          <FiX size={20} />
        </button>
      </div>
      <div className="bg-yellow-100 p-3 rounded-lg">
        <p className="font-semibold">{mistakes[currentIndex]}</p>
      </div>
      <div className="flex justify-between mt-4">
        <button onClick={handleIgnore} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
          Ignore
        </button>
        <button onClick={handleCorrect} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
          Correct
        </button>
        <button onClick={handleNext} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
          Next
        </button>
      </div>
    </div>
  );
};

export default SpellCheck;
