
import React from 'react';
import { FiChevronsRight } from 'react-icons/fi';

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

const PageLayout = ({ editor }) => {
  const addPageBreak = () => {
    editor.chain().focus().insertContent('<hr class="page-break">').run();
  };

  const setMargins = (margin) => {
    const proseElement = document.querySelector('.prose');
    if (proseElement) {
      proseElement.style.padding = margin;
    }
  };

  return (
    <div className="flex items-start gap-4 p-2">
        <div className="flex flex-col items-center">
            <RibbonButton action={addPageBreak} icon={FiChevronsRight} label="Page Break" />
            <span className="text-xs mt-1 text-gray-500">Page Setup</span>
        </div>
        <div className="flex flex-col items-center">
            <select onChange={(e) => setMargins(e.target.value)} className="p-2 rounded border border-gray-300 bg-white">
                <option value="2rem">Normal Margins</option>
                <option value="1.5rem">Narrow Margins</option>
                <option value="2.5rem">Wide Margins</option>
            </select>
            <span className="text-xs mt-1 text-gray-500">Margins</span>
        </div>
    </div>
  );
};

export default PageLayout;
