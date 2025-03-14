import React, { useEffect, useState, useRef, useImperativeHandle, forwardRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PdfPage } from './PdfPage';
import { ToolBar } from './ToolBar';
import { CommentPopup } from './CommentPopup';
import { TextInputPopup } from './TextInputPopup';
import { PinPopup } from './PinPopup';
import { useAnnotations } from '../hooks/useAnnotations';
import { PDFAnnotatorProps, Annotation, AnnotationMode, Point, ENEMCategory, AnnotationType, TagInterface } from '../types';
import { AnnotationDetails } from './AnnotationDetails';
import { annotationsToJSON, DEFAULT_CATEGORY_COLORS } from '../utils';

// Define a ref type for exposing methods
export interface PdfAnnotatorRef {
  getAnnotationsJSON: () => string;
}

export const PdfAnnotator = forwardRef<PdfAnnotatorRef, PDFAnnotatorProps>(({
  url,
  annotations = [],
  scale: initialScale = 1.0,
  pageNumber = 1,
  onDocumentLoadSuccess,
  onPageChange,
  annotationMode = AnnotationMode.NONE,
  onAnnotationModeChange,
  currentCategory,
  onCategoryChange,
  onAnnotationCreate,
  onAnnotationUpdate,
  onAnnotationDelete,
  onAnnotationSelect,
  highlightColor,
  underlineColor,
  strikeoutColor,
  rectangleColor,
  drawingColor,
  textColor,
  commentColor,
  pinColor = 'rgba(249, 115, 22, 0.7)', // Default orange
  categoryColors = DEFAULT_CATEGORY_COLORS,
  availableTags = [],
  pdfWorkerSrc,
}, ref) => {
  const [pdfDocument, setPdfDocument] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(pageNumber);
  const [scale, setScale] = useState<number>(initialScale);
  const [showCommentPopup, setShowCommentPopup] = useState<boolean>(false);
  const [commentPosition, setCommentPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showTextPopup, setShowTextPopup] = useState<boolean>(false);
  const [textPosition, setTextPosition] = useState<Point>({ x: 0, y: 0 });
  const [textPageIndex, setTextPageIndex] = useState<number>(0);
  const [showPinPopup, setShowPinPopup] = useState<boolean>(false);
  const [pinPosition, setPinPosition] = useState<Point>({ x: 0, y: 0 });
  const [pinPageIndex, setPinPageIndex] = useState<number>(0);
  const [selectedENEMCategory, setSelectedENEMCategory] = useState<ENEMCategory | undefined>(currentCategory);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Configure the PDF worker
  useEffect(() => {
    // Use the provided worker source or default to a CDN with HTTPS
    const workerSrc = pdfWorkerSrc || `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
  }, [pdfWorkerSrc]);
  
  const {
    annotations: localAnnotations,
    selectedAnnotation,
    currentMode,
    drawingPoints,
    isDrawing,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
    selectAnnotation,
    setMode,
  } = useAnnotations({
    initialAnnotations: annotations,
    annotationMode,
    currentCategory: selectedENEMCategory,
    onAnnotationCreate,
    onAnnotationUpdate,
    onAnnotationDelete,
    onAnnotationSelect,
    highlightColor,
    underlineColor,
    strikeoutColor,
    rectangleColor,
    drawingColor,
    textColor,
    commentColor,
    pinColor,
    categoryColors,
  });

  // Expose the getAnnotationsJSON method via ref
  useImperativeHandle(ref, () => ({
    getAnnotationsJSON: () => annotationsToJSON(localAnnotations)
  }));

  useEffect(() => {
    const loadDocument = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(url);
        const pdfDoc = await loadingTask.promise;
        
        setPdfDocument(pdfDoc);
        setNumPages(pdfDoc.numPages);
        
        if (onDocumentLoadSuccess) {
          onDocumentLoadSuccess(pdfDoc.numPages);
        }
      } catch (error) {
        console.error('Error loading PDF document:', error);
      }
    };

    loadDocument();
  }, [url, onDocumentLoadSuccess]);

  useEffect(() => {
    setMode(annotationMode);
  }, [annotationMode, setMode]);

  useEffect(() => {
    setSelectedENEMCategory(currentCategory);
  }, [currentCategory]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= numPages) {
      setCurrentPage(newPage);
      
      if (onPageChange) {
        onPageChange(newPage);
      }
    }
  };

  const handleAnnotationModeChange = (mode: AnnotationMode) => {
    setMode(mode);
    
    if (onAnnotationModeChange) {
      onAnnotationModeChange(mode);
    }
  };

  const handleCategoryChange = (category: ENEMCategory) => {
    setSelectedENEMCategory(category);
    
    if (onCategoryChange) {
      onCategoryChange(category);
    }
  };

  const handleAnnotationClick = (annotation: Annotation) => {
    selectAnnotation(annotation);
  };

  const handleCommentSubmit = (content: string) => {
    if (showCommentPopup && selectedAnnotation) {
      updateAnnotation(selectedAnnotation.id, { content });
      setShowCommentPopup(false);
    }
  };

  const handleAddComment = (point: Point, pageIndex: number) => {
    setCommentPosition(point);
    setShowCommentPopup(true);
  };

  // Handle adding text annotations
  const handleTextClick = (point: Point, pageIndex: number) => {
    if (currentMode === AnnotationMode.TEXT) {
      setTextPosition(point);
      setTextPageIndex(pageIndex);
      setShowTextPopup(true);
    }
  };

  const handleTextSubmit = (text: string) => {
    if (showTextPopup) {
      // Create a rectangle for the text
      const rect = {
        x: textPosition.x,
        y: textPosition.y,
        width: 200, // Default width
        height: 100, // Default height
        pageIndex: textPageIndex,
      };
      
      // Get the color based on the current category
      const textAnnotationColor = getAnnotationTypeColor(AnnotationType.TEXT);
      
      // Create the text annotation with the appropriate color
      const newAnnotation = createAnnotation(AnnotationType.TEXT, rect, text);
      
      // Update the annotation with the correct color if needed
      if (newAnnotation.color !== textAnnotationColor) {
        updateAnnotation(newAnnotation.id, { color: textAnnotationColor });
      }
      
      setShowTextPopup(false);
    }
  };

  const handleTextCancel = () => {
    setShowTextPopup(false);
  };

  // Handle adding pin annotations
  const handlePinClick = (point: Point, pageIndex: number) => {
    if (currentMode === AnnotationMode.PIN) {
      setPinPosition(point);
      setPinPageIndex(pageIndex);
      setShowPinPopup(true);
    }
  };

  const handlePinSubmit = (selectedTags: TagInterface[], content?: string) => {
    if (showPinPopup) {
      // Create a rectangle for the pin (pins are just points)
      const rect = {
        x: pinPosition.x,
        y: pinPosition.y,
        width: 24, // Width for clickable area
        height: 24, // Height for clickable area
        pageIndex: pinPageIndex,
      };
      
      // Get the color (use pin color or first tag's color if available)
      const pinAnnotationColor = pinColor;
      
      // Create the pin annotation
      const newAnnotation = createAnnotation(AnnotationType.PIN, rect, content || '');
      
      // Update the annotation with tags and color
      updateAnnotation(newAnnotation.id, {
        tags: selectedTags,
        color: pinAnnotationColor,
      });
      
      setShowPinPopup(false);
    }
  };

  const handlePinCancel = () => {
    setShowPinPopup(false);
  };

  const handleScaleChange = (newScale: number) => {
    setScale(newScale);
  };

  const renderPages = () => {
    if (!pdfDocument) return null;
    
    // For now, just render the current page
    return (
      <PdfPage
        key={`page_${currentPage}`}
        pdfDocument={pdfDocument}
        pageNumber={currentPage}
        scale={scale}
        annotations={localAnnotations}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onAnnotationClick={handleAnnotationClick}
        onCommentAdd={handleAddComment}
        onTextClick={(point, pageIndex) => {
          handleTextClick(point, pageIndex);
          handlePinClick(point, pageIndex);
        }}
        activeDrawingPoints={drawingPoints}
        isDrawing={isDrawing}
        drawingColor={getAnnotationTypeColor(AnnotationType.DRAWING)}
      />
    );
  };

  // Helper function to get the color for a specific annotation type
  const getAnnotationTypeColor = (type: AnnotationType): string => {
    // If we have a selected category, use its color
    if (selectedENEMCategory && categoryColors) {
      return categoryColors[selectedENEMCategory];
    }
    
    // Otherwise use the default color based on annotation type
    switch (type) {
      case AnnotationType.HIGHLIGHT:
        return highlightColor || 'rgba(255, 255, 0, 0.3)';
      case AnnotationType.UNDERLINE:
        return underlineColor || 'rgba(0, 100, 255, 0.7)';
      case AnnotationType.STRIKEOUT:
        return strikeoutColor || 'rgba(255, 0, 0, 0.5)';
      case AnnotationType.RECTANGLE:
        return rectangleColor || 'rgba(255, 0, 0, 0.3)';
      case AnnotationType.DRAWING:
        return drawingColor || 'rgba(255, 0, 0, 0.7)';
      case AnnotationType.TEXT:
        return textColor || 'rgba(0, 0, 0, 1)';
      case AnnotationType.COMMENT:
        return commentColor || 'rgba(255, 255, 0, 0.7)';
      case AnnotationType.PIN:
        return pinColor;
      default:
        return 'rgba(0, 0, 0, 1)';
    }
  };

  return (
    <div
      className="flex flex-col w-full h-full"
      ref={containerRef}
    >
      <ToolBar
        currentMode={currentMode}
        onModeChange={handleAnnotationModeChange}
        currentPage={currentPage}
        numPages={numPages}
        onPageChange={handlePageChange}
        currentCategory={selectedENEMCategory}
        onCategoryChange={handleCategoryChange}
        categoryColors={categoryColors}
        scale={scale}
        onScaleChange={handleScaleChange}
      />
      <div
        className="flex-grow bg-gray-200 overflow-auto p-4"
      >
        <div className="flex justify-center">
          {pdfDocument && renderPages()}
        </div>
        
        {showTextPopup && (
          <TextInputPopup
            position={textPosition}
            onSubmit={handleTextSubmit}
            onCancel={handleTextCancel}
          />
        )}
        
        {showCommentPopup && (
          <CommentPopup
            position={commentPosition}
            onSubmit={handleCommentSubmit}
            onCancel={() => setShowCommentPopup(false)}
          />
        )}

        {showPinPopup && availableTags.length > 0 && (
          <PinPopup
            position={pinPosition}
            onSubmit={handlePinSubmit}
            onCancel={handlePinCancel}
            availableTags={availableTags}
            initialTags={[]}
          />
        )}
      </div>
      
      {selectedAnnotation && (
        <AnnotationDetails
          annotation={selectedAnnotation}
          onUpdate={updateAnnotation}
          onDelete={deleteAnnotation}
          onClose={() => selectAnnotation(null)}
        />
      )}
    </div>
  );
});

// Helper function for getting annotations JSON without ref
export const getAnnotationsJSON = (annotations: Annotation[]): string => {
  return annotationsToJSON(annotations);
}; 