
import React, { useState } from 'react';
import { FiSearch, FiChevronDown, FiChevronUp, FiX } from 'react-icons/fi';

const FindAndReplace = ({ editor, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [replaceTerm, setReplaceTerm] = useState('');
  const [results, setResults] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const handleSearch = () => {
    if (!searchTerm) return;
    const { state } = editor;
    const newResults = [];
    state.doc.descendants((node, pos) => {
      if (node.isText) {
        const text = node.text;
        let offset = 0;
        while (offset < text.length) {
          const index = text.indexOf(searchTerm, offset);
          if (index === -1) break;
          newResults.push({ from: pos + index, to: pos + index + searchTerm.length });
          offset = index + 1;
        }
      }
    });
    setResults(newResults);
    setCurrentIndex(newResults.length > 0 ? 0 : -1);
    if (newResults.length > 0) {
      highlightResult(newResults[0]);
    }
  };

  const highlightResult = (result) => {
    editor.commands.setTextSelection(result);
    editor.view.dispatch(editor.view.state.tr.scrollIntoView());
  };

  const handleNext = () => {
    if (results.length === 0) return;
    const nextIndex = (currentIndex + 1) % results.length;
    setCurrentIndex(nextIndex);
    highlightResult(results[nextIndex]);
  };

  const handlePrev = () => {
    if (results.length === 0) return;
    const prevIndex = (currentIndex - 1 + results.length) % results.length;
    setCurrentIndex(prevIndex);
    highlightResult(results[prevIndex]);
  };

  const handleReplace = () => {
    if (currentIndex === -1) return;
    const { from, to } = results[currentIndex];
    editor.chain().focus().deleteRange({ from, to }).insertContent(replaceTerm).run();
    handleSearch(); // Re-run search to update results
  };

  const handleReplaceAll = () => {
    if (results.length === 0) return;
    const transaction = editor.state.tr;
    results.forEach(({ from, to }) => {
      transaction.deleteRange(from, to).insertText(replaceTerm, from);
    });
    editor.view.dispatch(transaction);
    setResults([]);
    setCurrentIndex(-1);
  };

  return (
    <div className="absolute top-0 right-0 bg-white shadow-lg rounded-lg p-4 w-80 border z-10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Find and Replace</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
          <FiX size={20} />
        </button>
      </div>
      <div className="flex flex-col gap-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Find..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-4 py-2 border rounded-lg"
          />
          <FiSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Replace with..."
            value={replaceTerm}
            onChange={(e) => setReplaceTerm(e.target.value)}
            className="w-full pl-8 pr-4 py-2 border rounded-lg"
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={handlePrev} disabled={results.length === 0} className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50">
              <FiChevronUp />
            </button>
            <button onClick={handleNext} disabled={results.length === 0} className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50">
              <FiChevronDown />
            </button>
            {results.length > 0 && (
              <span className="text-sm text-gray-500">
                {currentIndex + 1} of {results.length}
              </span>
            )}
          </div>
          <button onClick={handleSearch} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
            Find
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={handleReplace} disabled={currentIndex === -1} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50">
            Replace
          </button>
          <button onClick={handleReplaceAll} disabled={results.length === 0} className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50">
            Replace All
          </button>
        </div>
      </div>
    </div>
  );
};

export default FindAndReplace;
