import React from 'react';
import { format, formatDistanceToNow } from 'date-fns';

const VersionHistory = ({ versions, onSelectVersion, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-auto p-6 space-y-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b border-gray-200 pb-4">
          <h3 className="text-2xl font-bold text-gray-800">Version History</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 focus:outline-none">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="overflow-y-auto max-h-[60vh] space-y-4 pr-2">
          {versions.length > 0 ? (
            versions.map((version, index) => (
              <div key={version.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-700">
                      Version {versions.length - index}
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        ({version.timestamp ? formatDistanceToNow(version.timestamp.toDate(), { addSuffix: true }) : 'N/A'})
                      </span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {version.timestamp?.toDate ? format(version.timestamp.toDate(), 'MMMM d, yyyy HH:mm:ss') : ''}
                    </p>
                  </div>
                  <button 
                    onClick={() => onSelectVersion(version)} 
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Restore
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No versions available yet.</p>
              <p className="text-sm text-gray-400 mt-2">Start typing to save changes and create versions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VersionHistory;
