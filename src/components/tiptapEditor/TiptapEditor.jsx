import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import { Mark, Extension } from '@tiptap/core';
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
import FontSize from './FontSize';


// Custom Mark to handle citations.
const CitationMark = Mark.create({
  name: 'citation',
  addAttributes() { return { citationId: { default: null, parseHTML: el => el.getAttribute('data-citation-id'), renderHTML: attrs => ({ 'data-citation-id': attrs.citationId }) } }; },
  parseHTML() { return [{ tag: 'span' }] }, // Use a span or similar for inline citation
  renderHTML({ HTMLAttributes }) { return ['span', { ...HTMLAttributes, class: 'citation-highlight' }, 0] },
  addCommands() {
    return {
      setCitation: (citationId) => ({ commands }) => commands.setMark(this.name, { citationId }),
      unsetCitation: (citationId) => ({ commands }) => commands.unsetMark(this.name, { citationId }),
    };
  },
});
import './ResizableImage.css';

import Ribbon from './Ribbon';
import CitationModal from './CitationModal';
import Bibliography from './Bibliography';

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

const TiptapEditor = ({ content, onUpdate, onStartComment }) => {
  const [characterCount, setCharacterCount] = useState({ words: 0, characters: 0 });
  const [citations, setCitations] = useState({});
  const [showCitationModal, setShowCitationModal] = useState(false);
  const [showBibliography, setShowBibliography] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const editorWrapperRef = useRef(null);
  const lastContent = useRef(content);

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
      CitationMark,
      Link.configure({ openOnClick: false }),
      CharacterCount,
      LineHeight,
      PageBreak,
      FontSize,
      
    ],
    content: content,
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
    
    // Compare the prop content with the editor's current content
    const isSame = editor.getHTML() === content;

    // If the content is different, update the editor
    if (!isSame) {
      // Set the content without triggering the 'onUpdate' event to prevent loops
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const updateStats = () => {
      const stats = editor.storage.characterCount;
      setCharacterCount({ words: stats.words(), characters: stats.characters() });
    };

    const updatePageNumbers = () => {
      if (editorWrapperRef.current) {
        const pageBreaks = editorWrapperRef.current.querySelectorAll('.page-break');
        const total = pageBreaks.length + 1;
        setTotalPages(total);

        let current = 1;
        for (let i = 0; i < pageBreaks.length; i++) {
          const rect = pageBreaks[i].getBoundingClientRect();
          // If the page break is above or at the top of the viewport
          if (rect.top <= editorWrapperRef.current.getBoundingClientRect().top) {
            current = i + 2; // +1 for 0-indexed, +1 because it's the next page
          } else {
            break;
          }
        }
        setCurrentPage(current);
      }
    };

    const handleEditorTransaction = () => {
      console.log('Editor transaction occurred');
      updateStats();
      const newContent = editor.getHTML();
      if (onUpdate && newContent !== lastContent.current) {
        onUpdate(newContent);
        lastContent.current = newContent;
      }
    };

    const handleScroll = () => {
      updatePageNumbers();
    };

    editorWrapperRef.current?.addEventListener('scroll', handleScroll);
    editor.on('transaction', handleEditorTransaction); // Use transaction for all updates

    // Initial update
    handleEditorTransaction(); // Call once initially
    updatePageNumbers(); // Ensure page numbers are updated on initial load

    return () => {
      editorWrapperRef.current?.removeEventListener('scroll', handleScroll);
      editor.off('transaction', handleEditorTransaction); // Cleanup
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

  const handleAddCitation = (newCitation) => {
    setCitations((prevCitations) => ({
      ...prevCitations,
      [newCitation.id]: newCitation,
    }));
    // Optionally, apply the citation mark to the current selection
    if (editor) {
      editor.chain().focus().setCitation(newCitation.id).run();
    }
  };

  const handleCloseCitationModal = () => {
    setShowCitationModal(false);
  };

  

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <style>{`
        .comment-highlight { background-color: #fef08a; cursor: pointer; }
        .citation-highlight { background-color: #a7f3d0; cursor: pointer; }
        ins { background-color: #d4edda; text-decoration: none; }
        del { background-color: #f8d7da; text-decoration: line-through; }
        .ProseMirror table { border-collapse: collapse; width: 100%; }
        .ProseMirror th, .ProseMirror td { border: 1px solid #ccc; padding: 8px; }
        .ProseMirror th { background-color: #f2f2f2; }
        .page-break { 
            page-break-after: always; 
            border: 1px dashed #ccc;
            margin-top: 1rem;
            margin-bottom: 1rem;
            height: 0;
            position: relative;
            clear: both;
        }
        .page-break::before {
            content: 'Page Break';
            position: absolute;
            top: -0.75em;
            left: 50%;
            transform: translateX(-50%);
            background: #f3f3f3;
            padding: 0 0.5em;
            color: #888;
            font-size: 0.8em;
        }
        .page-container {
            counter-reset: page;
            background-color: white;
            box-shadow: 0 0 8px rgba(0,0,0,0.1);
            margin-bottom: 1rem;
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
        <Ribbon editor={editor} setShowCitationModal={setShowCitationModal} setShowBibliography={setShowBibliography} showBibliography={showBibliography} setIsSuggesting={setIsSuggesting} isSuggesting={isSuggesting} />
      </div>
      <div className="flex-grow overflow-auto p-8 bg-[#F3F3F3]" ref={editorWrapperRef}>
        <div className="page-container w-[8.5in] min-h-[11in] mx-auto">
          <EditorContent editor={editor} />
        </div>
        {showBibliography && <Bibliography citations={citations} />}
      </div>

      {/* Word Count Status Bar */}
      <div className="sticky bottom-0 z-10 flex justify-between items-center text-sm text-white p-2 bg-[#0078D4]">
        <div>Page {currentPage} of {totalPages}</div>
        <div className="flex items-center">
            <span>{characterCount.words} words</span>
            <span className="mx-2">|</span>
            <span>{characterCount.characters} characters</span>
        </div>
      </div>

      {showCitationModal && (
        <CitationModal
          onClose={handleCloseCitationModal}
          onSaveCitation={handleAddCitation}
        />
      )}
    </div>
  );
};

export default TiptapEditor;