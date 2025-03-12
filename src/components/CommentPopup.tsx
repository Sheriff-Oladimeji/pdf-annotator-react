import React, { useState, useRef, useEffect } from 'react';

interface CommentPopupProps {
  position: { x: number; y: number };
  onSubmit: (content: string) => void;
  onCancel: () => void;
  initialContent?: string;
}

export const CommentPopup: React.FC<CommentPopupProps> = ({
  position,
  onSubmit,
  onCancel,
  initialContent = '',
}) => {
  const [content, setContent] = useState(initialContent);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content);
    } else {
      onCancel();
    }
  };

  return (
    <div
      className="pdf-annotator-comment-popup"
      style={{
        position: 'absolute',
        top: position.y,
        left: position.x,
        zIndex: 1000,
        backgroundColor: 'white',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
        borderRadius: '4px',
        padding: '10px',
        minWidth: '250px',
      }}
    >
      <form onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment..."
          style={{
            width: '100%',
            minHeight: '80px',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            resize: 'vertical',
            fontFamily: 'inherit',
            fontSize: '14px',
            marginBottom: '10px',
          }}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px',
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '6px 12px',
              backgroundColor: '#f5f5f5',
              border: '1px solid #ddd',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              padding: '6px 12px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
}; 