
import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import {
  FiBold, FiItalic, FiUnderline, FiCode, FiList,
  FiAlignLeft, FiAlignCenter, FiAlignRight, FiAlignJustify
} from 'react-icons/fi';
import { FaStrikethrough, FaListOl } from 'react-icons/fa';

// --- Reusable Button for the Ribbon ---
const RibbonButton = ({ editor, action, icon: Icon, label, name }) => (
  <button
    onClick={action}
    className={`p-2 rounded-md hover:bg-gray-200 ${editor.isActive(name) ? 'bg-gray-200 text-teal-600' : 'text-gray-600'}`}
    title={label}
  >
    <Icon size={18} />
  </button>
);

// --- Menu Bar / Ribbon Component ---
const Ribbon = ({ editor }) => {
  if (!editor) return null;

  return (
    <div className="p-2 border border-gray-300 bg-white rounded-t-lg">
      {/* For now, we only have the Home tab */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Font Styling Group */}
        <div className="flex items-center gap-1 border-r pr-4">
          <RibbonButton editor={editor} action={() => editor.chain().focus().toggleBold().run()} icon={FiBold} label="Bold" name="bold" />
          <RibbonButton editor={editor} action={() => editor.chain().focus().toggleItalic().run()} icon={FiItalic} label="Italic" name="italic" />
          <RibbonButton editor={editor} action={() => editor.chain().focus().toggleUnderline().run()} icon={FiUnderline} label="Underline" name="underline" />
          <RibbonButton editor={editor} action={() => editor.chain().focus().toggleStrike().run()} icon={FaStrikethrough} label="Strikethrough" name="strike" />
        </div>

        {/* Headings Group */}
        <div className="flex items-center gap-1 border-r pr-4">
          <select
            value={editor.isActive('heading', { level: 1 }) ? 1 : editor.isActive('heading', { level: 2 }) ? 2 : editor.isActive('heading', { level: 3 }) ? 3 : 0}
            onChange={e => {
              const level = parseInt(e.target.value);
              if (level === 0) {
                editor.chain().focus().setParagraph().run();
              } else {
                editor.chain().focus().toggleHeading({ level: level }).run();
              }
            }}
            className="p-1.5 border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500"
          >
            <option value="0">Paragraph</option>
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
          </select>
        </div>

        {/* Text Alignment Group */}
        <div className="flex items-center gap-1 border-r pr-4">
          <RibbonButton editor={editor} action={() => editor.chain().focus().setTextAlign('left').run()} icon={FiAlignLeft} label="Align Left" name={{ textAlign: 'left' }} />
          <RibbonButton editor={editor} action={() => editor.chain().focus().setTextAlign('center').run()} icon={FiAlignCenter} label="Align Center" name={{ textAlign: 'center' }} />
          <RibbonButton editor={editor} action={() => editor.chain().focus().setTextAlign('right').run()} icon={FiAlignRight} label="Align Right" name={{ textAlign: 'right' }} />
          <RibbonButton editor={editor} action={() => editor.chain().focus().setTextAlign('justify').run()} icon={FiAlignJustify} label="Align Justify" name={{ textAlign: 'justify' }} />
        </div>

        {/* Lists and Code Group */}
        <div className="flex items-center gap-1">
          <RibbonButton editor={editor} action={() => editor.chain().focus().toggleBulletList().run()} icon={FiList} label="Bullet List" name="bulletList" />
          <RibbonButton editor={editor} action={() => editor.chain().focus().toggleOrderedList().run()} icon={FaListOl} label="Numbered List" name="orderedList" />
          <RibbonButton editor={editor} action={() => editor.chain().focus().toggleCodeBlock().run()} icon={FiCode} label="Code Block" name="codeBlock" />
        </div>
      </div>
    </div>
  );
};


// --- The Main Tiptap Editor Component ---
const TiptapEditor = ({ initialContent, onUpdate }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      if (onUpdate) {
        onUpdate(editor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none p-6 border-x border-b border-gray-300 rounded-b-lg min-h-[500px] focus:outline-none bg-white',
      },
    },
  });

  return (
    <div>
      <Ribbon editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;
