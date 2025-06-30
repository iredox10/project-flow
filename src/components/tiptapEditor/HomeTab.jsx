
import React, { useState } from 'react';
import {
  FiBold, FiItalic, FiUnderline, FiList, FiAlignLeft,
  FiAlignCenter, FiAlignRight, FiAlignJustify,
  FiRotateCcw, FiRotateCw, FiChevronDown
} from 'react-icons/fi';
import {
  FaStrikethrough, FaListOl, FaSubscript, FaSuperscript,
  FaHighlighter, FaQuoteLeft, FaFont
} from 'react-icons/fa';

// --- Reusable Button Component ---
const RibbonButton = ({ editor, action, icon: Icon, label, name }) => (
  <button onClick={action} className={`p-2 rounded-md hover:bg-gray-200 ${editor.isActive(name) ? 'bg-gray-200 text-teal-600' : 'text-gray-600'}`} title={label}>
    <Icon size={18} />
  </button>
);

// --- Dropdown for Styles (Headings, Paragraph) ---
const StylesDropdown = ({ editor }) => {
  const [isOpen, setIsOpen] = useState(false);

  const styles = [
    { name: 'Paragraph', action: () => editor.chain().focus().setParagraph().run(), isActive: editor.isActive('paragraph') },
    { name: 'Heading 1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: editor.isActive('heading', { level: 1 }) },
    { name: 'Heading 2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: editor.isActive('heading', { level: 2 }) },
    { name: 'Heading 3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), isActive: editor.isActive('heading', { level: 3 }) },
  ];

  const activeStyle = styles.find(s => s.isActive)?.name || 'Styles';

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 p-2 border border-gray-300 rounded-md text-sm font-medium">
        <span>{activeStyle}</span>
        <FiChevronDown />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border shadow-lg rounded-md w-40 z-10">
          {styles.map(style => (
            <button key={style.name} onClick={() => { style.action(); setIsOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
              {style.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}


const HomeTab = ({ editor }) => {
  if (!editor) return null;
  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* History Group */}
      <div className="flex items-center gap-1 border-r pr-4">
        <RibbonButton editor={editor} action={() => editor.chain().focus().undo().run()} icon={FiRotateCcw} label="Undo" name="undo" />
        <RibbonButton editor={editor} action={() => editor.chain().focus().redo().run()} icon={FiRotateCw} label="Redo" name="redo" />
      </div>

      {/* Styles Group */}
      <div className="flex items-center gap-1 border-r pr-4">
        <StylesDropdown editor={editor} />
      </div>

      {/* Font Group */}
      <div className="flex items-center gap-1 border-r pr-4">
        <RibbonButton editor={editor} action={() => editor.chain().focus().toggleBold().run()} icon={FiBold} label="Bold" name="bold" />
        <RibbonButton editor={editor} action={() => editor.chain().focus().toggleItalic().run()} icon={FiItalic} label="Italic" name="italic" />
        <RibbonButton editor={editor} action={() => editor.chain().focus().toggleUnderline().run()} icon={FiUnderline} label="Underline" name="underline" />
        <RibbonButton editor={editor} action={() => editor.chain().focus().toggleStrike().run()} icon={FaStrikethrough} label="Strikethrough" name="strike" />
        <RibbonButton editor={editor} action={() => editor.chain().focus().toggleSubscript().run()} icon={FaSubscript} label="Subscript" name="subscript" />
        <RibbonButton editor={editor} action={() => editor.chain().focus().toggleSuperscript().run()} icon={FaSuperscript} label="Superscript" name="superscript" />
      </div>

      {/* Color Group */}
      <div className="flex items-center gap-2 border-r pr-4">
        <div title="Text Color" className="flex items-center gap-1 p-1 rounded-md hover:bg-gray-200">
          <FaFont className="text-gray-600" />
          <input type="color" onInput={event => editor.chain().focus().setColor(event.target.value).run()} value={editor.getAttributes('textStyle').color || '#000000'} className="w-6 h-6 border-none bg-transparent" />
        </div>
        <div title="Highlight Color" className="flex items-center gap-1 p-1 rounded-md hover:bg-gray-200">
          <FaHighlighter className="text-gray-600" />
          <input type="color" onInput={event => editor.chain().focus().toggleHighlight({ color: event.target.value }).run()} value={editor.getAttributes('highlight').color || '#ffffff'} className="w-6 h-6 border-none bg-transparent" />
        </div>
      </div>

      {/* Paragraph Group */}
      <div className="flex items-center gap-1">
        <RibbonButton editor={editor} action={() => editor.chain().focus().toggleBulletList().run()} icon={FiList} label="Bullet List" name="bulletList" />
        <RibbonButton editor={editor} action={() => editor.chain().focus().toggleOrderedList().run()} icon={FaListOl} label="Numbered List" name="orderedList" />
        <RibbonButton editor={editor} action={() => editor.chain().focus().setTextAlign('left').run()} icon={FiAlignLeft} label="Align Left" name={{ textAlign: 'left' }} />
        <RibbonButton editor={editor} action={() => editor.chain().focus().setTextAlign('center').run()} icon={FiAlignCenter} label="Align Center" name={{ textAlign: 'center' }} />
        <RibbonButton editor={editor} action={() => editor.chain().focus().setTextAlign('right').run()} icon={FiAlignRight} label="Align Right" name={{ textAlign: 'right' }} />
        <RibbonButton editor={editor} action={() => editor.chain().focus().setTextAlign('justify').run()} icon={FiAlignJustify} label="Align Justify" name={{ textAlign: 'justify' }} />
        <RibbonButton editor={editor} action={() => editor.chain().focus().toggleBlockquote().run()} icon={FaQuoteLeft} label="Blockquote" name="blockquote" />
      </div>
    </div>
  )
};
export default HomeTab;
