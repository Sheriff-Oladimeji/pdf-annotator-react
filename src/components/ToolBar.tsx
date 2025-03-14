import React from 'react';
import { AnnotationMode, ENEMCategory } from '../types';
import { getCategoryDisplayName } from '../utils';

interface ToolBarProps {
  currentMode: AnnotationMode;
  onModeChange: (mode: AnnotationMode) => void;
  currentPage: number;
  numPages: number;
  onPageChange: (page: number) => void;
  currentCategory?: ENEMCategory;
  onCategoryChange?: (category: ENEMCategory) => void;
  categoryColors?: Record<ENEMCategory, string>;
  scale: number;
  onScaleChange: (scale: number) => void;
}

export const ToolBar: React.FC<ToolBarProps> = ({
  currentMode,
  onModeChange,
  currentPage,
  numPages,
  onPageChange,
  currentCategory,
  onCategoryChange,
  categoryColors,
  scale,
  onScaleChange,
}) => {
  const handleZoomIn = () => {
    onScaleChange(Math.min(scale + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    onScaleChange(Math.max(scale - 0.2, 0.5));
  };

  const handleZoomReset = () => {
    onScaleChange(1.0);
  };

  const zoomPercentage = Math.round(scale * 100);

  // Handle category change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as ENEMCategory;
    onCategoryChange?.(value);
  };

  // Group tools into categories
  return (
    <div className="w-full bg-gray-100 border-b border-gray-300 shadow-sm">
      {/* Main toolbar with essential tools */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <button
            className={`p-2 rounded-md border border-gray-300 ${
              currentMode === AnnotationMode.NONE ? 'bg-blue-100 border-blue-400' : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => onModeChange(AnnotationMode.NONE)}
            title="Select Tool"
          >
            <span role="img" aria-label="Hand">👆</span>
          </button>
          
          <div className="h-8 border-r border-gray-300 mx-1"></div>
          
          <button
            className={`p-2 rounded-md border border-gray-300 ${
              currentMode === AnnotationMode.HIGHLIGHT ? 'bg-blue-100 border-blue-400' : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => onModeChange(AnnotationMode.HIGHLIGHT)}
            title="Highlight Text"
          >
            <span role="img" aria-label="Highlight">🖌️</span>
          </button>
          
          <button
            className={`p-2 rounded-md border border-gray-300 ${
              currentMode === AnnotationMode.UNDERLINE ? 'bg-blue-100 border-blue-400' : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => onModeChange(AnnotationMode.UNDERLINE)}
            title="Underline Text"
          >
            <span role="img" aria-label="Underline">_</span>
          </button>
          
          <button
            className={`p-2 rounded-md border border-gray-300 ${
              currentMode === AnnotationMode.STRIKEOUT ? 'bg-blue-100 border-blue-400' : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => onModeChange(AnnotationMode.STRIKEOUT)}
            title="Strikethrough Text"
          >
            <span role="img" aria-label="Strikeout">✂️</span>
          </button>
          
          <div className="h-8 border-r border-gray-300 mx-1"></div>
          
          <button
            className={`p-2 rounded-md border border-gray-300 ${
              currentMode === AnnotationMode.RECTANGLE ? 'bg-blue-100 border-blue-400' : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => onModeChange(AnnotationMode.RECTANGLE)}
            title="Draw Rectangle"
          >
            <span role="img" aria-label="Rectangle">⬜</span>
          </button>
          
          <button
            className={`p-2 rounded-md border border-gray-300 ${
              currentMode === AnnotationMode.DRAWING ? 'bg-blue-100 border-blue-400' : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => onModeChange(AnnotationMode.DRAWING)}
            title="Free Drawing"
          >
            <span role="img" aria-label="Drawing">✏️</span>
          </button>
          
          <div className="h-8 border-r border-gray-300 mx-1"></div>
          
          <button
            className={`p-2 rounded-md border border-gray-300 ${
              currentMode === AnnotationMode.TEXT ? 'bg-blue-100 border-blue-400' : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => onModeChange(AnnotationMode.TEXT)}
            title="Add Text"
          >
            <span role="img" aria-label="Text">T</span>
          </button>
          
          <button
            className={`p-2 rounded-md border border-gray-300 ${
              currentMode === AnnotationMode.COMMENT ? 'bg-blue-100 border-blue-400' : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => onModeChange(AnnotationMode.COMMENT)}
            title="Add Comment"
          >
            <span role="img" aria-label="Comment">💬</span>
          </button>
          
          <button
            className={`p-2 rounded-md border border-gray-300 ${
              currentMode === AnnotationMode.PIN ? 'bg-blue-100 border-blue-400' : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => onModeChange(AnnotationMode.PIN)}
            title="Add Issue Pin"
          >
            <span role="img" aria-label="Pin">📌</span>
          </button>
        </div>
        
        {/* Page navigation and zoom controls */}
        <div className="flex items-center space-x-4">
          {/* Category selector dropdown */}
          <div className="relative">
            <select
              value={currentCategory || ''}
              onChange={handleCategoryChange}
              className="appearance-none bg-white border border-gray-300 rounded-md py-1.5 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                borderBottom: currentCategory ? `3px solid ${categoryColors?.[currentCategory] || 'transparent'}` : undefined
              }}
            >
              <option value="">Select Category</option>
              {Object.values(ENEMCategory).map((category) => (
                <option key={category} value={category}>
                  {getCategoryDisplayName(category)}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
          
          {/* Zoom controls */}
          <div className="flex items-center bg-white border border-gray-300 rounded-md">
            <button
              onClick={handleZoomOut}
              className="px-2 py-1 border-r border-gray-300 hover:bg-gray-100"
              title="Zoom Out"
            >
              −
            </button>
            <button
              onClick={handleZoomReset}
              className="px-2 py-1 border-r border-gray-300 hover:bg-gray-100"
              title="Reset Zoom"
            >
              {zoomPercentage}%
            </button>
            <button
              onClick={handleZoomIn}
              className="px-2 py-1 hover:bg-gray-100"
              title="Zoom In"
            >
              +
            </button>
          </div>

          {/* Page navigation */}
          <div className="flex items-center bg-white border border-gray-300 rounded-md">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className={`px-2 py-1 border-r border-gray-300 ${
                currentPage <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
              }`}
              title="Previous Page"
            >
              ⬅️
            </button>
            <span className="px-3 py-1 text-sm">
              Page {currentPage} of {numPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= numPages}
              className={`px-2 py-1 ${
                currentPage >= numPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
              }`}
              title="Next Page"
            >
              ➡️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 