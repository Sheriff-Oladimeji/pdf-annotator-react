import React, { useState } from 'react';
import { Annotation } from '../types';

interface AnnotationDetailsProps {
  annotation: Annotation;
  onUpdate: (id: string, updates: Partial<Annotation>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export const AnnotationDetails: React.FC<AnnotationDetailsProps> = ({
  annotation,
  onUpdate,
  onDelete,
  onClose,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(annotation.content || '');

  const handleSave = () => {
    onUpdate(annotation.id, { content });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this annotation?')) {
      onDelete(annotation.id);
    }
  };

  const formatDate = (date: Date) => {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    return date.toLocaleString();
  };

  return (
    <div
      className="pdf-annotator-annotation-details"
      style={{
        position: 'fixed',
        right: '20px',
        top: '70px',
        width: '300px',
        backgroundColor: 'white',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
        borderRadius: '4px',
        padding: '15px',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          Annotation
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          &times;
        </button>
      </div>

      <div
        style={{
          borderBottom: '1px solid #eee',
          paddingBottom: '10px',
          marginBottom: '10px',
        }}
      >
        <p>
          <strong>Type:</strong> {annotation.type}
        </p>
        <p>
          <strong>Created:</strong> {formatDate(annotation.createdAt)}
        </p>
        {annotation.updatedAt && (
          <p>
            <strong>Updated:</strong> {formatDate(annotation.updatedAt)}
          </p>
        )}
        {annotation.author && (
          <p>
            <strong>Author:</strong> {annotation.author}
          </p>
        )}
      </div>

      {isEditing ? (
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              minHeight: '80px',
              marginBottom: '10px',
              resize: 'vertical',
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
              onClick={() => setIsEditing(false)}
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
              onClick={handleSave}
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
        </div>
      ) : (
        <div>
          <div
            style={{
              marginBottom: '15px',
            }}
          >
            <strong>Content:</strong>
            <p
              style={{
                margin: '5px 0 0',
                whiteSpace: 'pre-wrap',
              }}
            >
              {annotation.content || '(No content)'}
            </p>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '8px',
            }}
          >
            <button
              onClick={handleDelete}
              style={{
                padding: '6px 12px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Delete
            </button>
            <button
              onClick={() => setIsEditing(true)}
              style={{
                padding: '6px 12px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Edit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}; 