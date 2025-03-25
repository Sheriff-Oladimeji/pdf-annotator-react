import React from 'react';
import { AnnotationMode, CategoryItem } from '../types';
import { 
  IoHandRightOutline, 
  IoTextOutline, 
  IoChatbubbleOutline, 
  IoPinOutline,
  IoRemoveOutline,
  IoChevronForward, 
  IoChevronBack, 
  IoAddOutline,
  IoCaretDown,
  IoResize
} from 'react-icons/io5';
import { 
  FaHighlighter, 
  FaUnderline, 
  FaStrikethrough,
  FaSquare, 
  FaPencilAlt,
  FaMarker,
  FaSlidersH
} from 'react-icons/fa';
import ThicknessDropdown from './ThicknessDropdown';

interface ToolBarProps {
  currentMode: AnnotationMode;
  onModeChange: (mode: AnnotationMode) => void;
  currentPage: number;
  numPages: number;
  onPageChange: (page: number) => void;
  currentCategory?: CategoryItem;
  onCategoryChange?: (category: CategoryItem | undefined) => void;
  customCategories?: CategoryItem[];
  scale: number;
  onScaleChange: (scale: number) => void;
  onFitToWidth?: () => void;
  currentThickness?: number;
  onThicknessChange?: (thickness: number) => void;
  viewOnly?: boolean;
}

export const ToolBar: React.FC<ToolBarProps> = ({
  currentMode,
  onModeChange,
  currentPage,
  numPages,
  onPageChange,
  currentCategory,
  onCategoryChange,
  customCategories = [],
  scale,
  onScaleChange,
  onFitToWidth,
  currentThickness = 8,
  onThicknessChange,
  viewOnly = false,
}) => {
  const handleZoomIn = () => {
    onScaleChange(Math.min(scale + 0.2, 3.0));
  };

  const handleZoomOut = () => {
    onScaleChange(Math.max(scale - 0.2, 0.5));
  };

  const handleZoomReset = () => {
    if (onFitToWidth) {
      onFitToWidth();
    } else {
      onScaleChange(1.0);
    }
  };

  const zoomPercentage = Math.round(scale * 100);

  // Handle category change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = parseInt(e.target.value, 10);
    // Find the category item that matches the selected ID
    const selectedCategory = customCategories.find(cat => cat.category === categoryId);
    if (selectedCategory && onCategoryChange) {
      onCategoryChange(selectedCategory);
    }
  };

  // Handle thickness change
  const handleThicknessChange = (thickness: number) => {
    if (onThicknessChange) {
      onThicknessChange(thickness);
    }
  };

  // Show thickness selector only for relevant modes
  const shouldShowThicknessSelector = [
    AnnotationMode.DRAWING, 
    AnnotationMode.HIGHLIGHTING, 
    AnnotationMode.RECTANGLE
  ].includes(currentMode);

  return (
    <div className="transition-shadow duration-200 bg-white toolbar" style={{ height: '60px' }}>
      {/* Main toolbar with essential tools */}
      <div className="flex flex-wrap items-center justify-between h-full px-4 py-2 border-b border-gray-200">
        { (
          <div className="flex items-center space-x-4">
            {/* Category selector dropdown */}
            <div className="relative flex items-center">
              <select
                value={currentCategory?.category.toString() || ''}
                onChange={handleCategoryChange}
                className="appearance-none bg-white border border-gray-300 rounded-md py-1.5 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  borderBottom: currentCategory ? `3px solid ${currentCategory.color || 'transparent'}` : undefined
                }}
              >
                <option value="">Filtrar por Categoria</option>
                {customCategories.map((category) => (
                  <option key={category.category} value={category.category}>
                    {category.displayName}
                  </option>
                ))}
              </select>
              <div className="absolute right-0 flex items-center px-2 text-gray-700 pointer-events-none" style={{ right: "0.5rem" }}>
                <IoCaretDown className="w-4 h-4" />
              </div>
              
              {currentCategory && (
                <button
                  onClick={() => onCategoryChange && onCategoryChange(undefined)}
                  className="flex items-center p-1 ml-2 text-xs bg-gray-100 rounded-md hover:bg-gray-200"
                  title="Limpar filtro"
                >
                  <IoRemoveOutline size={14} className="mr-1" />
                  Limpar
                </button>
              )}
            </div>

            {/* Thickness selector - only show when in drawing, highlighting or rectangle mode */}
            {!viewOnly && shouldShowThicknessSelector && (
              <ThicknessDropdown
                currentThickness={currentThickness}
                handleThicknessChange={handleThicknessChange}
              />
              // <div className="flex items-center px-2 py-1 space-x-2 bg-white border border-gray-300 rounded-md">
              //   <FaSlidersH size={14} className="text-gray-600" />
              //   <span className="mr-1 text-xs text-gray-700">Espessura:</span>
              //   {[4, 8, 12, 16].map(thickness => (
              //     <button
              //       key={thickness}
              //       onClick={() => handleThicknessChange(thickness)}
              //       className={`w-6 h-6 rounded-full flex items-center justify-center ${
              //         currentThickness === thickness ? 'bg-blue-100 border border-blue-400' : 'hover:bg-gray-100'
              //       }`}
              //       title={`Espessura ${thickness}px`}
              //     >
              //       <div 
              //         className="bg-gray-700 rounded-full" 
              //         style={{ 
              //           width: `${Math.min(thickness * 1.5, 16)}px`, 
              //           height: `${Math.min(thickness * 1.5, 16)}px` 
              //         }}
              //       />
              //     </button>
              //   ))}
              // </div>
            )}
          </div>
        )}

        {!viewOnly && (
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
            
            <div className="h-8 mx-1 border-r border-gray-300"></div>
            
            <button
              className={`p-2 rounded-md border border-gray-300 ${
                currentMode === AnnotationMode.STRIKEOUT ? 'bg-blue-100 border-blue-400' : 'bg-white hover:bg-gray-50'
              }`}
              onClick={() => onModeChange(AnnotationMode.STRIKEOUT)}
              title="Riscar Texto"
            >
              <FaStrikethrough size={16} />
            </button>
            
            <div className="h-8 mx-1 border-r border-gray-300"></div>
            
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
            
            <button
              className={`p-2 rounded-md border border-gray-300 ${
                currentMode === AnnotationMode.HIGHLIGHTING ? 'bg-blue-100 border-blue-400' : 'bg-white hover:bg-gray-50'
              }`}
              onClick={() => onModeChange(AnnotationMode.HIGHLIGHTING)}
              title="Marcador"
            >
              <FaMarker size={16} />
            </button>
          </div>
        )}
        
        {/* Page navigation and zoom controls - always visible */}
        <div className={`flex items-center space-x-4`}>
          <div className="flex items-center space-x-4">
            {/* Zoom controls */}
            <div className="flex items-center bg-white border border-gray-300 rounded-md">
              <button
                onClick={handleZoomOut}
                className="flex items-center justify-center px-2 py-1 border-r border-gray-300 hover:bg-gray-100"
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
                className="flex items-center justify-center px-2 py-1 hover:bg-gray-100"
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
    </div>
  );
}; 