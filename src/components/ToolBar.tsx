import React from 'react';
import { AnnotationMode } from '../types';

interface ToolBarProps {
  currentMode: AnnotationMode;
  onModeChange: (mode: AnnotationMode) => void;
  currentPage: number;
  numPages: number;
  onPageChange: (page: number) => void;
}

export const ToolBar: React.FC<ToolBarProps> = ({
  currentMode,
  onModeChange,
  currentPage,
  numPages,
  onPageChange,
}) => {
  return (
    <div
      className="pdf-annotator-toolbar"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px',
        backgroundColor: '#f5f5f5',
        borderBottom: '1px solid #ddd',
      }}
    >
      <div className="pdf-annotator-tools">
        <button
          className={`pdf-annotator-tool ${currentMode === AnnotationMode.NONE ? 'active' : ''}`}
          onClick={() => onModeChange(AnnotationMode.NONE)}
          title="Pan/Select"
          style={{
            padding: '8px',
            margin: '0 5px',
            backgroundColor: currentMode === AnnotationMode.NONE ? '#ddd' : 'transparent',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          <span role="img" aria-label="Hand">👆</span>
        </button>
        <button
          className={`pdf-annotator-tool ${currentMode === AnnotationMode.HIGHLIGHT ? 'active' : ''}`}
          onClick={() => onModeChange(AnnotationMode.HIGHLIGHT)}
          title="Highlight"
          style={{
            padding: '8px',
            margin: '0 5px',
            backgroundColor: currentMode === AnnotationMode.HIGHLIGHT ? '#ddd' : 'transparent',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          <span role="img" aria-label="Highlight">🖌️</span>
        </button>
        <button
          className={`pdf-annotator-tool ${currentMode === AnnotationMode.UNDERLINE ? 'active' : ''}`}
          onClick={() => onModeChange(AnnotationMode.UNDERLINE)}
          title="Underline"
          style={{
            padding: '8px',
            margin: '0 5px',
            backgroundColor: currentMode === AnnotationMode.UNDERLINE ? '#ddd' : 'transparent',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          <span role="img" aria-label="Underline">_</span>
        </button>
        <button
          className={`pdf-annotator-tool ${currentMode === AnnotationMode.STRIKEOUT ? 'active' : ''}`}
          onClick={() => onModeChange(AnnotationMode.STRIKEOUT)}
          title="Strikeout"
          style={{
            padding: '8px',
            margin: '0 5px',
            backgroundColor: currentMode === AnnotationMode.STRIKEOUT ? '#ddd' : 'transparent',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          <span role="img" aria-label="Strikeout">✂️</span>
        </button>
        <button
          className={`pdf-annotator-tool ${currentMode === AnnotationMode.RECTANGLE ? 'active' : ''}`}
          onClick={() => onModeChange(AnnotationMode.RECTANGLE)}
          title="Rectangle"
          style={{
            padding: '8px',
            margin: '0 5px',
            backgroundColor: currentMode === AnnotationMode.RECTANGLE ? '#ddd' : 'transparent',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          <span role="img" aria-label="Rectangle">⬜</span>
        </button>
        <button
          className={`pdf-annotator-tool ${currentMode === AnnotationMode.DRAWING ? 'active' : ''}`}
          onClick={() => onModeChange(AnnotationMode.DRAWING)}
          title="Drawing"
          style={{
            padding: '8px',
            margin: '0 5px',
            backgroundColor: currentMode === AnnotationMode.DRAWING ? '#ddd' : 'transparent',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          <span role="img" aria-label="Drawing">✏️</span>
        </button>
        <button
          className={`pdf-annotator-tool ${currentMode === AnnotationMode.TEXT ? 'active' : ''}`}
          onClick={() => onModeChange(AnnotationMode.TEXT)}
          title="Text"
          style={{
            padding: '8px',
            margin: '0 5px',
            backgroundColor: currentMode === AnnotationMode.TEXT ? '#ddd' : 'transparent',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          <span role="img" aria-label="Text">T</span>
        </button>
        <button
          className={`pdf-annotator-tool ${currentMode === AnnotationMode.COMMENT ? 'active' : ''}`}
          onClick={() => onModeChange(AnnotationMode.COMMENT)}
          title="Comment"
          style={{
            padding: '8px',
            margin: '0 5px',
            backgroundColor: currentMode === AnnotationMode.COMMENT ? '#ddd' : 'transparent',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          <span role="img" aria-label="Comment">💬</span>
        </button>
      </div>
      
      <div className="pdf-annotator-pagination" style={{ display: 'flex', alignItems: 'center' }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          style={{
            padding: '8px',
            margin: '0 5px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage <= 1 ? 0.5 : 1,
          }}
        >
          &lt;
        </button>
        
        <span>
          Page {currentPage} of {numPages}
        </span>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= numPages}
          style={{
            padding: '8px',
            margin: '0 5px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            cursor: currentPage >= numPages ? 'not-allowed' : 'pointer',
            opacity: currentPage >= numPages ? 0.5 : 1,
          }}
        >
          &gt;
        </button>
      </div>
    </div>
  );
}; 