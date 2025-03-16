import React from 'react';
import { AnnotationMode, ENEMCategory, CategoryType } from '../types';
import { getCategoryDisplayName } from '../utils';
import { 
  IoHandRightOutline, 
  IoTextOutline, 
  IoChatbubbleOutline, 
  IoPinOutline,
  IoRemoveOutline,
  IoChevronForward, 
  IoChevronBack, 
  IoAddOutline,
  IoCaretDown
} from 'react-icons/io5';
import { 
  FaHighlighter, 
  FaUnderline, 
  FaStrikethrough,
  FaSquare, 
  FaPencilAlt 
} from 'react-icons/fa';

interface ToolBarProps {
  currentMode: AnnotationMode;
  onModeChange: (mode: AnnotationMode) => void;
  currentPage: number;
  numPages: number;
  onPageChange: (page: number) => void;
  currentCategory?: CategoryType;
  onCategoryChange?: (category: CategoryType) => void;
  categoryColors?: Record<string, string>;
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
    const value = e.target.value as CategoryType;
    onCategoryChange?.(value);
  };

  // Group tools into categories
  return (
    <div className="w-full bg-gray-100 border-b border-gray-300 shadow-sm">
      {/* Main toolbar with essential tools */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 border-b border-gray-200">
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
              <option value="">Selecionar Categoria</option>
              {Object.values(ENEMCategory).map((category) => (
                <option key={category} value={category}>
                  {getCategoryDisplayName(category)}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <IoCaretDown className="h-4 w-4" />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            className={`p-2 rounded-md border border-gray-300 ${
              currentMode === AnnotationMode.NONE ? 'bg-blue-100 border-blue-400' : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => onModeChange(AnnotationMode.NONE)}
            title="Ferramenta de Seleção"
          >
            <IoHandRightOutline size={18} />
          </button>
          
          <div className="h-8 border-r border-gray-300 mx-1"></div>
          
          <button
            className={`p-2 rounded-md border border-gray-300 ${
              currentMode === AnnotationMode.HIGHLIGHT ? 'bg-blue-100 border-blue-400' : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => onModeChange(AnnotationMode.HIGHLIGHT)}
            title="Destacar Texto"
          >
            <FaHighlighter size={16} />
          </button>
          
          <button
            className={`p-2 rounded-md border border-gray-300 ${
              currentMode === AnnotationMode.UNDERLINE ? 'bg-blue-100 border-blue-400' : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => onModeChange(AnnotationMode.UNDERLINE)}
            title="Sublinhar Texto"
          >
            <FaUnderline size={16} />
          </button>
          
          <button
            className={`p-2 rounded-md border border-gray-300 ${
              currentMode === AnnotationMode.STRIKEOUT ? 'bg-blue-100 border-blue-400' : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => onModeChange(AnnotationMode.STRIKEOUT)}
            title="Riscar Texto"
          >
            <FaStrikethrough size={16} />
          </button>
          
          <div className="h-8 border-r border-gray-300 mx-1"></div>
          
          <button
            className={`p-2 rounded-md border border-gray-300 ${
              currentMode === AnnotationMode.RECTANGLE ? 'bg-blue-100 border-blue-400' : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => onModeChange(AnnotationMode.RECTANGLE)}
            title="Desenhar Retângulo"
          >
            <FaSquare size={16} />
          </button>
          
          <button
            className={`p-2 rounded-md border border-gray-300 ${
              currentMode === AnnotationMode.DRAWING ? 'bg-blue-100 border-blue-400' : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => onModeChange(AnnotationMode.DRAWING)}
            title="Desenho Livre"
          >
            <FaPencilAlt size={16} />
          </button>
          
          <div className="h-8 border-r border-gray-300 mx-1"></div>
          
          <button
            className={`p-2 rounded-md border border-gray-300 ${
              currentMode === AnnotationMode.TEXT ? 'bg-blue-100 border-blue-400' : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => onModeChange(AnnotationMode.TEXT)}
            title="Adicionar Texto"
          >
            <IoTextOutline size={18} />
          </button>
          
          <button
            className={`p-2 rounded-md border border-gray-300 ${
              currentMode === AnnotationMode.COMMENT ? 'bg-blue-100 border-blue-400' : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => onModeChange(AnnotationMode.COMMENT)}
            title="Adicionar Comentário"
          >
            <IoChatbubbleOutline size={18} />
          </button>
          
          <button
            className={`p-2 rounded-md border border-gray-300 ${
              currentMode === AnnotationMode.PIN ? 'bg-blue-100 border-blue-400' : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => onModeChange(AnnotationMode.PIN)}
            title="Adicionar Marcador"
          >
            <IoPinOutline size={18} />
          </button>
        </div>
        
        {/* Page navigation and zoom controls */}
        <div className="flex items-center space-x-4">
          {/* Zoom controls */}
          <div className="flex items-center bg-white border border-gray-300 rounded-md">
            <button
              onClick={handleZoomOut}
              className="px-2 py-1 border-r border-gray-300 hover:bg-gray-100 flex items-center justify-center"
              title="Diminuir Zoom"
            >
              <IoRemoveOutline size={16} />
            </button>
            <button
              onClick={handleZoomReset}
              className="px-2 py-1 border-r border-gray-300 hover:bg-gray-100"
              title="Redefinir Zoom"
            >
              {zoomPercentage}%
            </button>
            <button
              onClick={handleZoomIn}
              className="px-2 py-1 hover:bg-gray-100 flex items-center justify-center"
              title="Aumentar Zoom"
            >
              <IoAddOutline size={16} />
            </button>
          </div>

          {/* Page navigation */}
          <div className="flex items-center bg-white border border-gray-300 rounded-md">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className={`px-2 py-1 border-r border-gray-300 flex items-center justify-center ${
                currentPage <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
              }`}
              title="Página Anterior"
            >
              <IoChevronBack size={16} />
            </button>
            <span className="px-3 py-1 text-sm">
              Página {currentPage} de {numPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= numPages}
              className={`px-2 py-1 flex items-center justify-center ${
                currentPage >= numPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
              }`}
              title="Próxima Página"
            >
              <IoChevronForward size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 