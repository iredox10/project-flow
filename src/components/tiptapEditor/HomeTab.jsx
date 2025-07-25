
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  FiBold, FiItalic, FiUnderline, FiAlignLeft, FiAlignCenter, FiAlignRight, 
  FiAlignJustify, FiChevronDown, FiLink, FiTrash2, FiCopy, FiClipboard, FiScissors
} from 'react-icons/fi';
import {
  FaStrikethrough, FaListOl, FaListUl, FaSubscript, FaSuperscript, 
  FaHighlighter, FaQuoteLeft, FaFont, FaPaintBrush
} from 'react-icons/fa';
import { LuHeading1, LuHeading2, LuHeading3 } from "react-icons/lu";
import { BsTextParagraph } from "react-icons/bs";

// --- Reusable Button Component ---
const RibbonButton = ({ editor, action, icon: Icon, label, name, disabled = false, children }) => (
  <button
    onClick={action}
    className={`p-1 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center w-16 h-16 ${editor.isActive(name) ? 'bg-gray-200 text-blue-600' : 'text-gray-700'}`}
    title={label}
    disabled={disabled}
  >
    <Icon size={20} />
    <span className="text-xs mt-1">{label}</span>
    {children}
  </button>
);

const SmallRibbonButton = ({ editor, action, icon: Icon, label, name, disabled = false }) => (
    <button
      onClick={action}
      className={`p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${editor.isActive(name) ? 'bg-gray-200' : ''}`}
      title={label}
      disabled={disabled}
    >
      <Icon size={16} />
    </button>
  );

// --- Dropdown Component ---
const Dropdown = ({ buttonContent, children, buttonTitle }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button title={buttonTitle} onClick={() => setIsOpen(!isOpen)} className="p-1 rounded hover:bg-gray-200 flex flex-col items-center justify-center w-16 h-16 text-gray-700">
                {buttonContent}
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white border shadow-lg rounded-md w-48 z-20">
                    {children}
                </div>
            )}
        </div>
    );
};

const ColorPicker = ({ onSelect, title }) => {
    const colors = ['#000000', '#e60000', '#ff9900', '#ffff00', '#008a00', '#0066cc', '#9933ff', '#ffffff', '#facccc', '#ffebcc', '#ffffcc', '#cce8cc', '#cce0f5', '#ebd6ff', '#bbbbbb', '#f06666', '#ffc266', '#ffff66', '#66b966', '#66a3e0', '#c285ff', '#888888', '#a10000', '#b36b00', '#b3b300', '#006100', '#0047b3', '#6b24b2'];
    return (
        <div className="p-2">
            <div className="text-sm text-gray-500 mb-2">{title}</div>
            <div className="grid grid-cols-7 gap-1">
                {colors.map(color => (
                    <button key={color} onClick={() => onSelect(color)} className="w-6 h-6 rounded-sm border" style={{ backgroundColor: color }} />
                ))}
            </div>
        </div>
    )
}

const HomeTab = ({ editor }) => {
  if (!editor) return null;

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const handleCopy = () => navigator.clipboard.writeText(editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to));
  const handleCut = () => {
    handleCopy();
    editor.chain().focus().deleteSelection().run();
  }
  const handlePaste = async () => {
      const text = await navigator.clipboard.readText();
      editor.chain().focus().insertContent(text).run();
  }

  const FontColorButton = (
    <>
        <FaFont size={20} />
        <span className="text-xs mt-1">Font Color</span>
        <FiChevronDown size={10} />
    </>
  );

  const HighlightColorButton = (
    <>
        <FaHighlighter size={20} />
        <span className="text-xs mt-1">Highlight</span>
        <FiChevronDown size={10} />
    </>
  );

  const StylesButton = (
      <>
        <FaPaintBrush size={20}/>
        <span className="text-xs mt-1">Styles</span>
        <FiChevronDown size={10} />
      </>
  )

  return (
    <div className="flex items-start gap-4 p-2">
      {/* Clipboard Group */}
      <div className="flex flex-col items-center">
        <div className="flex">
            <RibbonButton editor={editor} action={handleCut} icon={FiScissors} label="Cut" name="cut" />
            <RibbonButton editor={editor} action={handleCopy} icon={FiCopy} label="Copy" name="copy" />
            <RibbonButton editor={editor} action={handlePaste} icon={FiClipboard} label="Paste" name="paste" />
        </div>
        <span className="text-xs mt-1 text-gray-500">Clipboard</span>
      </div>

      {/* Font Group */}
      <div className="flex flex-col items-center">
        <div className="flex items-center border rounded bg-white p-1">
            <select onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()} className="text-sm border-r pr-2">
                <option value="inter">Inter</option>
                <option value="arial">Arial</option>
                <option value="times new roman">Times New Roman</option>
            </select>
            <select onChange={(e) => editor.chain().focus().toggleHeading({ level: parseInt(e.target.value) }).run()} className="text-sm pl-2">
                <option value="12">12</option>
                <option value="14">14</option>
                <option value="16">16</option>
            </select>
        </div>
        <div className="flex mt-1">
            <SmallRibbonButton editor={editor} action={() => editor.chain().focus().toggleBold().run()} icon={FiBold} label="Bold" name="bold" />
            <SmallRibbonButton editor={editor} action={() => editor.chain().focus().toggleItalic().run()} icon={FiItalic} label="Italic" name="italic" />
            <SmallRibbonButton editor={editor} action={() => editor.chain().focus().toggleUnderline().run()} icon={FiUnderline} label="Underline" name="underline" />
            <SmallRibbonButton editor={editor} action={() => editor.chain().focus().toggleStrike().run()} icon={FaStrikethrough} label="Strikethrough" name="strike" />
            <SmallRibbonButton editor={editor} action={() => editor.chain().focus().toggleSubscript().run()} icon={FaSubscript} label="Subscript" name="subscript" />
            <SmallRibbonButton editor={editor} action={() => editor.chain().focus().toggleSuperscript().run()} icon={FaSuperscript} label="Superscript" name="superscript" />
        </div>
        <div className="flex mt-1">
            <Dropdown buttonContent={FontColorButton} buttonTitle="Font Color">
                <ColorPicker title="Theme Colors" onSelect={color => editor.chain().focus().setColor(color).run()} />
            </Dropdown>
            <Dropdown buttonContent={HighlightColorButton} buttonTitle="Text Highlight Color">
                <ColorPicker title="Highlight Colors" onSelect={color => editor.chain().focus().toggleHighlight({ color }).run()} />
            </Dropdown>
            <RibbonButton editor={editor} action={() => editor.chain().focus().unsetAllMarks().run()} icon={FiTrash2} label="Clear Format" name="clear" />
        </div>
        <span className="text-xs mt-1 text-gray-500">Font</span>
      </div>

      {/* Paragraph Group */}
      <div className="flex flex-col items-center">
        <div className="flex">
            <SmallRibbonButton editor={editor} action={() => editor.chain().focus().toggleBulletList().run()} icon={FaListUl} label="Bullet List" name="bulletList" />
            <SmallRibbonButton editor={editor} action={() => editor.chain().focus().toggleOrderedList().run()} icon={FaListOl} label="Numbered List" name="orderedList" />
            <select onChange={(e) => editor.chain().focus().setLineHeight(e.target.value).run()} className="p-1 text-xs rounded border border-gray-300 bg-white">
                <option value="1">1.0</option>
                <option value="1.15">1.15</option>
                <option value="1.5">1.5</option>
                <option value="2">2.0</option>
            </select>
        </div>
        <div className="flex mt-1">
            <SmallRibbonButton editor={editor} action={() => editor.chain().focus().setTextAlign('left').run()} icon={FiAlignLeft} label="Align Left" name={{ textAlign: 'left' }} />
            <SmallRibbonButton editor={editor} action={() => editor.chain().focus().setTextAlign('center').run()} icon={FiAlignCenter} label="Align Center" name={{ textAlign: 'center' }} />
            <SmallRibbonButton editor={editor} action={() => editor.chain().focus().setTextAlign('right').run()} icon={FiAlignRight} label="Align Right" name={{ textAlign: 'right' }} />
            <SmallRibbonButton editor={editor} action={() => editor.chain().focus().setTextAlign('justify').run()} icon={FiAlignJustify} label="Align Justify" name={{ textAlign: 'justify' }} />
        </div>
        <span className="text-xs mt-1 text-gray-500">Paragraph</span>
      </div>

      {/* Styles Group */}
      <div className="flex flex-col items-center">
        <Dropdown buttonContent={StylesButton} buttonTitle="Styles">
            <div className="p-1">
                <button onClick={() => editor.chain().focus().setParagraph().run()} className="flex items-center gap-2 p-2 w-full hover:bg-gray-100">
                    <BsTextParagraph size={20} />
                    <span>Normal</span>
                </button>
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className="flex items-center gap-2 p-2 w-full hover:bg-gray-100">
                    <LuHeading1 size={20} />
                    <span>Heading 1</span>
                </button>
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="flex items-center gap-2 p-2 w-full hover:bg-gray-100">
                    <LuHeading2 size={20} />
                    <span>Heading 2</span>
                </button>
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className="flex items-center gap-2 p-2 w-full hover:bg-gray-100">
                    <LuHeading3 size={20} />
                    <span>Heading 3</span>
                </button>
            </div>
        </Dropdown>
        <span className="text-xs mt-1 text-gray-500">Styles</span>
      </div>

    </div>
  )
};
export default HomeTab;

