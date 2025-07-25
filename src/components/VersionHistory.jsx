import React from 'react';
import { format } from 'date-fns';

const VersionHistory = ({ versions, onSelectVersion, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto p-6">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg font-semibold">Version History</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="mt-4 space-y-2">
          {versions.map((version) => (
            <div key={version.id} className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-100">
              <span>{format(version.timestamp.toDate(), 'PPpp')}</span>
              <button onClick={() => onSelectVersion(version.content)} className="text-blue-500 hover:text-blue-700">Restore</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VersionHistory;
