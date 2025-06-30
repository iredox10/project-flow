
/*
 * ===============================================================
 * FILE: src/components/tiptapEditor/TableTab.jsx
 * ===============================================================
 */
import React from 'react';
import {
  RiMergeCellsHorizontal, RiSplitCellsHorizontal, RiDeleteBin6Line,
} from 'react-icons/ri';

const SmallButton = ({ action, label, editor, name }) => (
  <button onClick={action} title={label} className="text-xs px-2 py-1 rounded hover:bg-gray-200 disabled:opacity-50" disabled={!editor.can()[name]}>
    {label}
  </button>
);

const TableRibbonButton = ({ action, icon: Icon, label, name, editor }) => (
  <button onClick={action} className={`p-2 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed ${editor.isActive(name) ? 'bg-gray-200 text-teal-600' : 'text-gray-600'}`} title={label} disabled={!editor.can()[name]}>
    <Icon size={18} />
  </button>
);

const TableTab = ({ editor }) => {
  if (!editor) return null;
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-1 border-r pr-4">
        <SmallButton editor={editor} action={() => editor.chain().focus().addColumnBefore().run()} label="Add Col Before" name="addColumnBefore" />
        <SmallButton editor={editor} action={() => editor.chain().focus().addColumnAfter().run()} label="Add Col After" name="addColumnAfter" />
        <SmallButton editor={editor} action={() => editor.chain().focus().deleteColumn().run()} label="Delete Column" name="deleteColumn" />
      </div>
      <div className="flex items-center gap-1 border-r pr-4">
        <SmallButton editor={editor} action={() => editor.chain().focus().addRowBefore().run()} label="Add Row Before" name="addRowBefore" />
        <SmallButton editor={editor} action={() => editor.chain().focus().addRowAfter().run()} label="Add Row After" name="addRowAfter" />
        <SmallButton editor={editor} action={() => editor.chain().focus().deleteRow().run()} label="Delete Row" name="deleteRow" />
      </div>
      <div className="flex items-center gap-1 border-r pr-4">
        <TableRibbonButton editor={editor} action={() => editor.chain().focus().mergeCells().run()} icon={RiMergeCellsHorizontal} label="Merge Cells" name="mergeCells" />
        <TableRibbonButton editor={editor} action={() => editor.chain().focus().splitCell().run()} icon={RiSplitCellsHorizontal} label="Split Cell" name="splitCell" />
      </div>
      <div className="flex items-center gap-1">
        <TableRibbonButton editor={editor} action={() => editor.chain().focus().deleteTable().run()} icon={RiDeleteBin6Line} label="Delete Table" name="deleteTable" />
      </div>
    </div>
  )
};
export default TableTab;
