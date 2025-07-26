import { Node } from '@tiptap/core';

const PageBreak = Node.create({
  name: 'pageBreak',

  group: 'block',

  selectable: true,
  draggable: true,

  parseHTML() {
    return [
      {
        tag: 'div.page-break',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { ...HTMLAttributes, class: 'page-break' }];
  },

  addCommands() {
    return {
      setPageBreak: () => ({ commands }) => {
        return commands.insertContent('<div class="page-break"></div>');
      },
    };
  },
});

export default PageBreak;
