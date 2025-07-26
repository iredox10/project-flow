import { Mark } from '@tiptap/core';

const InsertionMark = Mark.create({
  name: 'insertion',

  addAttributes() {
    return {
      author: { default: null },
      timestamp: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'ins',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['ins', HTMLAttributes];
  },
});

const DeletionMark = Mark.create({
  name: 'deletion',

  addAttributes() {
    return {
      author: { default: null },
      timestamp: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'del',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['del', HTMLAttributes];
  },
});

export { InsertionMark, DeletionMark };
