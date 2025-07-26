
import React from 'react';
import {
  RiMergeCellsHorizontal, RiSplitCellsHorizontal, RiDeleteBin6Line,
  RiInsertRowTop, RiInsertRowBottom, RiInsertColumnLeft, RiInsertColumnRight,
  RiDeleteRow, RiDeleteColumn
} from 'react-icons/ri';

const RibbonButton = ({ action, icon: Icon, label, editor, name }) => (
  <button
    onClick={action}
    className={`p-1 rounded hover:bg-gray-200 flex flex-col items-center justify-center w-20 h-20 text-gray-700'}`}
    title={label}
    disabled={editor && !editor.can()[name] ? true : false}
  >
    <Icon size={24} />
    <span className="text-xs mt-1">{label}</span>
  </button>
);

const TableTab = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className="flex items-start gap-4 p-2">
      <div className="flex flex-col items-center">
        <div className="flex">
          <RibbonButton editor={editor} action={() => editor.chain().focus().addRowBefore().run()} icon={RiInsertRowTop} label="Insert Row Above" name="addRowBefore" />
          <RibbonButton editor={editor} action={() => editor.chain().focus().addRowAfter().run()} icon={RiInsertRowBottom} label="Insert Row Below" name="addRowAfter" />
          <RibbonButton editor={editor} action={() => editor.chain().focus().addColumnBefore().run()} icon={RiInsertColumnLeft} label="Insert Left" name="addColumnBefore" />
          <RibbonButton editor={editor} action={() => editor.chain().focus().addColumnAfter().run()} icon={RiInsertColumnRight} label="Insert Right" name="addColumnAfter" />
        </div>
        <span className="text-xs mt-1 text-gray-500">Insert</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="flex">
          <RibbonButton editor={editor} action={() => editor.chain().focus().deleteRow().run()} icon={RiDeleteRow} label="Delete Row" name="deleteRow" />
          <RibbonButton editor={editor} action={() => editor.chain().focus().deleteColumn().run()} icon={RiDeleteColumn} label="Delete Column" name="deleteColumn" />
          <RibbonButton editor={editor} action={() => editor.chain().focus().deleteTable().run()} icon={RiDeleteBin6Line} label="Delete Table" name="deleteTable" />
        </div>
        <span className="text-xs mt-1 text-gray-500">Delete</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="flex">
          <RibbonButton editor={editor} action={() => editor.chain().focus().mergeCells().run()} icon={RiMergeCellsHorizontal} label="Merge Cells" name="mergeCells" />
          <RibbonButton editor={editor} action={() => editor.chain().focus().splitCell().run()} icon={RiSplitCellsHorizontal} label="Split Cell" name="splitCell" />
        </div>
        <span className="text-xs mt-1 text-gray-500">Merge</span>
      </div>
    </div>
  );
};

export default TableTab;
