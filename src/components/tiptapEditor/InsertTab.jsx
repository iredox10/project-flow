
import React from 'react';
import { FiImage, FiGrid, FiLink, FiChevronsUp, FiChevronsDown, FiFileText, FiBookOpen } from 'react-icons/fi';

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

const InsertTab = ({ editor, setShowCitationModal }) => {
  if (!editor) return null;

  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (readerEvent) => {
          const url = readerEvent.target.result;
          editor.chain().focus().setImage({ src: url }).run();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const addLink = () => {
      const url = window.prompt("URL");
      if(url) {
          editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
      }
  }

  return (
    <div className="flex items-start gap-4 p-2">
        {/* Tables Group */}
        <div className="flex flex-col items-center">
            <RibbonButton action={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} icon={FiGrid} label="Table" />
            <span className="text-xs mt-1 text-gray-500">Tables</span>
        </div>

        {/* Media Group */}
        <div className="flex flex-col items-center">
            <RibbonButton action={addImage} icon={FiImage} label="Picture" />
            <span className="text-xs mt-1 text-gray-500">Illustrations</span>
        </div>

        {/* Links Group */}
        <div className="flex flex-col items-center">
            <RibbonButton action={addLink} icon={FiLink} label="Link" />
            <span className="text-xs mt-1 text-gray-500">Links</span>
        </div>

        {/* Header & Footer Group */}
        <div className="flex flex-col items-center">
            <div className="flex">
                <RibbonButton action={() => {}} icon={FiChevronsUp} label="Header" />
                <RibbonButton action={() => {}} icon={FiChevronsDown} label="Footer" />
            </div>
            <span className="text-xs mt-1 text-gray-500">Header & Footer</span>
        </div>

        {/* Page Layout Group */}
        <div className="flex flex-col items-center">
            <RibbonButton action={() => editor.chain().focus().setPageBreak().run()} icon={FiFileText} label="Page Break" />
            <span className="text-xs mt-1 text-gray-500">Page Layout</span>
        </div>

        {/* Citations Group */}
        <div className="flex flex-col items-center">
            <RibbonButton action={() => setShowCitationModal(true)} icon={FiBookOpen} label="Citation" />
            <span className="text-xs mt-1 text-gray-500">Citations</span>
        </div>
    </div>
  );
};
export default InsertTab;
