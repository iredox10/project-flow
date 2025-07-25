
import React from 'react';
import { FiBook } from 'react-icons/fi';

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

const ReferencesTab = ({ editor }) => {
  const generateTableOfContents = () => {
    if (!editor) return;

    const headings = [];
    const transaction = editor.state.tr;

    editor.state.doc.descendants((node, pos) => {
      if (node.type.name === 'heading') {
        const id = `heading-${headings.length + 1}`;
        headings.push({
          level: node.attrs.level,
          text: node.textContent,
          id: id,
        });
        // Add an ID to the heading node in the document
        if (node.attrs.id !== id) {
            transaction.setNodeMarkup(pos, undefined, { ...node.attrs, id: id });
        }
      }
    });

    // Dispatch the transaction to update heading nodes with IDs
    editor.view.dispatch(transaction);

    // Generate the HTML for the Table of Contents
    if (headings.length > 0) {
      const tocHTML = '<h2>Table of Contents</h2>' + headings.map(heading =>
        `<p style="margin-left: ${heading.level * 10}px;">
           <a href="#${heading.id}">${heading.text}</a>
         </p>`
      ).join('');

      // Insert the TOC at the current cursor position
      editor.chain().focus().insertContent(tocHTML).run();
    }
  };

  return (
    <div className="flex items-start gap-4 p-2">
        <div className="flex flex-col items-center">
            <RibbonButton action={generateTableOfContents} icon={FiBook} label="Table of Contents" />
            <span className="text-xs mt-1 text-gray-500">Table of Contents</span>
        </div>
    </div>
  );
};

export default ReferencesTab;
