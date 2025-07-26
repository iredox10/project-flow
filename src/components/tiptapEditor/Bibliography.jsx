import React from 'react';

const Bibliography = ({ citations }) => {
  if (Object.keys(citations).length === 0) {
    return <div className="p-4 text-gray-600">No citations added yet.</div>;
  }

  const formatCitation = (citation) => {
    // Simple APA-like formatting for demonstration
    return `${citation.author} (${citation.year}). ${citation.title}.`;
  };

  return (
    <div className="p-4 bg-white shadow-lg rounded-lg mt-4">
      <h2 className="text-xl font-bold mb-4">References</h2>
      <ul className="list-disc pl-5">
        {Object.values(citations).map((citation) => (
          <li key={citation.id} className="mb-2">
            {formatCitation(citation)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Bibliography;
