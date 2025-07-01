
import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import { Mark } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
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
  // State to hold the character count, ensuring the UI re-renders on change.
  const [characterCount, setCharacterCount] = useState({ words: 0, characters: 0 });

  const editor = useEditor({
    extensions: [
      StarterKit, Underline, TextAlign.configure({ types: ['heading', 'paragraph'] }), Image,
      Table.configure({ resizable: true }), TableRow, TableHeader, TableCell, FontFamily, TextStyle, Color,
      Highlight.configure({ multicolor: true }), Superscript, Subscript, CommentMark,
      Link.configure({ openOnClick: false }),
      CharacterCount,
    ],
    content: initialContent,
    // This `onUpdate` callback now handles both parent updates and the character count state.
    onUpdate: ({ editor }) => {
      // Update parent component's content
      if (onUpdate) {
        onUpdate(editor.getHTML());
      }
      // Update local state for character count to trigger re-render
      const stats = editor.storage.characterCount;
      setCharacterCount({ words: stats.words(), characters: stats.characters() });
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none p-6 border-x border-b border-gray-300 rounded-b-lg min-h-[500px] focus:outline-none bg-white',
      },
    },
  });

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
    <div>
      <style>{`.comment-highlight { background-color: #fef08a; cursor: pointer; }`}</style>

      {editor &&
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} shouldShow={({ from, to }) => from !== to}>
          <div className="bg-white border shadow-lg rounded-lg flex">
            <button onClick={handleStartComment} className="p-2 flex items-center gap-2 text-sm hover:bg-gray-100">
              <FiMessageSquare size={16} /> Add Comment
            </button>
          </div>
        </BubbleMenu>
      }

      <Ribbon editor={editor} />
      <EditorContent editor={editor} />

      {/* Word Count Status Bar - now reads from state */}
      <div className="flex justify-end text-sm text-gray-500 p-2 border-x border-b rounded-b-lg bg-gray-50">
        <span>{characterCount.words} words</span>
        <span className="mx-2">|</span>
        <span>{characterCount.characters} characters</span>
      </div>
    </div>
  );
};

export default TiptapEditor;
