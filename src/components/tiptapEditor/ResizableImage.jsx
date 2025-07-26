
import { Image } from '@tiptap/extension-image';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import React, { useRef, useEffect } from 'react';

const ResizableImageComponent = ({ node, updateAttributes, selected }) => {
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        // Logic to handle deselection if needed
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleResize = (e, corner) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = wrapperRef.current.offsetWidth;
    const startHeight = wrapperRef.current.offsetHeight;

    const onMouseMove = (moveEvent) => {
      let newWidth = startWidth;
      let newHeight = startHeight;

      if (corner.includes('r')) {
        newWidth = startWidth + (moveEvent.clientX - startX);
      }
      if (corner.includes('l')) {
        newWidth = startWidth - (moveEvent.clientX - startX);
      }
      if (corner.includes('b')) {
        newHeight = startHeight + (moveEvent.clientY - startY);
      }
      if (corner.includes('t')) {
        newHeight = startHeight - (moveEvent.clientY - startY);
      }

      updateAttributes({
        width: `${newWidth}px`,
        height: 'auto', // Maintain aspect ratio
      });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <NodeViewWrapper
      ref={wrapperRef}
      className={`resizable-image-wrapper ${selected ? 'selected' : ''}`}
      style={{ width: node.attrs.width, height: node.attrs.height }}
    >
      <img src={node.attrs.src} alt={node.attrs.alt} />
      {selected && (
        <>
          <div className="resize-handle tl" onMouseDown={(e) => handleResize(e, 'tl')}></div>
          <div className="resize-handle tr" onMouseDown={(e) => handleResize(e, 'tr')}></div>
          <div className="resize-handle bl" onMouseDown={(e) => handleResize(e, 'bl')}></div>
          <div className="resize-handle br" onMouseDown={(e) => handleResize(e, 'br')}></div>
        </>
      )}
    </NodeViewWrapper>
  );
};

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        renderHTML: (attributes) => ({
          width: attributes.width,
        }),
      },
      height: {
        default: 'auto',
        renderHTML: (attributes) => ({
          height: attributes.height,
        }),
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },
});

export default ResizableImage;
