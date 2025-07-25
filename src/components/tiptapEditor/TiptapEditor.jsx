
import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import { Mark } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import ResizableImage from './ResizableImage.jsx';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import FontFamily from '@tiptap/extension-font-family';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Superscript from '@tiptap/extension-superscript';
import Subscript from '@tiptap/extension-subscript';
import Link from '@tiptap/extension-link';
import CharacterCount from '@tiptap/extension-character-count';
import { FiMessageSquare } from 'react-icons/fi';
import { v4 as uuidv4 } from 'uuid';
import { LineHeight } from './LineHeight';
import PageBreak from './PageBreak';
import './ResizableImage.css';

import Ribbon from './Ribbon';

// Custom Mark to handle comments.
const CommentMark = Mark.create({
  name: 'comment',
  addAttributes() { return { commentId: { default: null, parseHTML: el => el.getAttribute('data-comment-id'), renderHTML: attrs => ({ 'data-comment-id': attrs.commentId }) } }; },
  parseHTML() { return [{ tag: 'mark' }] },
  renderHTML({ HTMLAttributes }) { return ['mark', { ...HTMLAttributes, class: 'comment-highlight' }, 0] },
  addCommands() {
    return {
      setComment: (commentId) => ({ commands }) => commands.setMark(this.name, { commentId }),
      unsetComment: (commentId) => ({ commands }) => commands.unsetMark(this.name, { commentId }),
    };
  },
});

const TiptapEditor = ({ initialContent, onUpdate, onStartComment }) => {
  const [characterCount, setCharacterCount] = useState({ words: 0, characters: 0 });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        textStyle: {
          HTMLAttributes: {
            class: null,
          },
        },
      }),
      Underline, 
      TextAlign.configure({ types: ['heading', 'paragraph'] }), 
      ResizableImage.configure({
        inline: true,
      }),
      Table.configure({ resizable: true }), 
      TableRow, 
      TableHeader, 
      TableCell, 
      TextStyle,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      Color,
      Highlight.configure({ multicolor: true }), 
      Superscript, 
      Subscript, 
      CommentMark,
      Link.configure({ openOnClick: false }),
      CharacterCount,
      LineHeight,
      PageBreak,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none p-8 focus:outline-none bg-white shadow-lg',
      },
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const updateStats = () => {
      const stats = editor.storage.characterCount;
      setCharacterCount({ words: stats.words(), characters: stats.characters() });
    };

    const handleUpdate = () => {
      if (onUpdate) {
        onUpdate(editor.getHTML());
      }
      updateStats();
    };

    editor.on('update', handleUpdate);
    editor.on('selectionUpdate', handleUpdate);

    // Initial update
    handleUpdate();

    return () => {
      editor.off('update', handleUpdate);
      editor.off('selectionUpdate', handleUpdate);
    };
  }, [editor, onUpdate]);

  const handleStartComment = () => {
    const { from, to } = editor.state.selection;
    const highlightedText = editor.state.doc.textBetween(from, to);
    if (highlightedText) {
      const commentId = uuidv4();
      editor.chain().focus().setComment(commentId).run();
      onStartComment?.(commentId, highlightedText);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <style>{`
        .comment-highlight { background-color: #fef08a; cursor: pointer; }
        .ProseMirror table { border-collapse: collapse; width: 100%; }
        .ProseMirror th, .ProseMirror td { border: 1px solid #ccc; padding: 8px; }
        .ProseMirror th { background-color: #f2f2f2; }
        .page-break { 
            page-break-after: always; 
            border: 1px dashed #ccc;
            margin-top: 1rem;
            margin-bottom: 1rem;
        }
        .page-container {
            counter-reset: page;
        }
        .page {
            position: relative;
            counter-increment: page;
        }
        .page::after {
            content: "Page " counter(page);
            position: absolute;
            bottom: 10px;
            right: 10px;
            font-size: 12px;
            color: #888;
        }
      `}</style>

      {editor &&
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} shouldShow={({ from, to }) => from !== to}>
          <div className="bg-white border shadow-lg rounded-lg flex">
            <button onClick={handleStartComment} className="p-2 flex items-center gap-2 text-sm hover:bg-gray-100">
              <FiMessageSquare size={16} /> Add Comment
            </button>
          </div>
        </BubbleMenu>
      }

      <div className="sticky top-0 z-10">
        <Ribbon editor={editor} />
      </div>
      <div className="flex-grow overflow-auto p-8 bg-[#F3F3F3]">
        <div className="page-container w-[8.5in] min-h-[11in] mx-auto">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Word Count Status Bar */}
      <div className="sticky bottom-0 z-10 flex justify-between items-center text-sm text-white p-2 bg-[#0078D4]">
        <div>Page 1 of 1</div>
        <div className="flex items-center">
            <span>{characterCount.words} words</span>
            <span className="mx-2">|</span>
            <span>{characterCount.characters} characters</span>
        </div>
      </div>
    </div>
  );
};

export default TiptapEditor;
