import React, { useEffect, useState, useRef, useImperativeHandle, forwardRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PdfPage } from './PdfPage';
import { ToolBar } from './ToolBar';
import { CommentPopup } from './CommentPopup';
import { TextInputPopup } from './TextInputPopup';
import { PinPopup } from './PinPopup';
import { useAnnotations } from '../hooks/useAnnotations';
import { PDFAnnotatorProps, Annotation, AnnotationMode, Point, ENEMCategory, AnnotationType, TagInterface, CategoryType } from '../types';
import { AnnotationDetails } from './AnnotationDetails';
import { annotationsToJSON, DEFAULT_CATEGORY_COLORS } from '../utils';
import { AnnotationLayer } from './AnnotationLayer';

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
  highlightingColor = 'rgba(255, 255, 0, 0.4)', // Default transparent yellow
  categoryColors = {} as Record<string, string>,
  customCategories = [],
  availableTags = [],
  pdfWorkerSrc,
  fitToWidth = true, // New prop to control whether to fit to width
  defaultThickness,
}, ref) => {
  // Default thickness values if not provided
  const defaultThicknessValues = defaultThickness || {
    [AnnotationMode.DRAWING]: 4,
    [AnnotationMode.HIGHLIGHTING]: 10,
    [AnnotationMode.RECTANGLE]: 2
  };

  const [pdfDocument, setPdfDocument] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(pageNumber);
  const [scale, setScale] = useState<number>(initialScale);
  const [originalPageWidth, setOriginalPageWidth] = useState<number | null>(null);
  const [showCommentPopup, setShowCommentPopup] = useState<boolean>(false);
  const [commentPosition, setCommentPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showTextPopup, setShowTextPopup] = useState<boolean>(false);
  const [textPosition, setTextPosition] = useState<Point>({ x: 0, y: 0 });
  const [textPageIndex, setTextPageIndex] = useState<number>(0);
  const [showPinPopup, setShowPinPopup] = useState<boolean>(false);
  const [pinPosition, setPinPosition] = useState<Point>({ x: 0, y: 0 });
  const [pinPageIndex, setPinPageIndex] = useState<number>(0);
  const [selectedENEMCategory, setSelectedENEMCategory] = useState<CategoryType | undefined>(
    currentCategory || (customCategories.length > 0 ? customCategories[0].id : Object.values(ENEMCategory)[0])
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedAnnotationPosition, setSelectedAnnotationPosition] = useState<{ x: number, y: number } | null>(null);
  const [isNewAnnotation, setIsNewAnnotation] = useState(false);
  const [lastMousePosition, setLastMousePosition] = useState<{ x: number, y: number } | null>(null);
  
  // Initialize with the current mode's default thickness
  const [currentMode, setCurrentMode] = useState<AnnotationMode>(annotationMode);
  const [annotationThickness, setAnnotationThickness] = useState<number>(
    annotationMode === AnnotationMode.DRAWING 
      ? defaultThicknessValues[AnnotationMode.DRAWING] 
      : annotationMode === AnnotationMode.HIGHLIGHTING 
        ? defaultThicknessValues[AnnotationMode.HIGHLIGHTING]
        : annotationMode === AnnotationMode.RECTANGLE
          ? defaultThicknessValues[AnnotationMode.RECTANGLE]
          : 2
  );
  
  // Configure the PDF worker
  useEffect(() => {
    // Use the provided worker source or default to a CDN with HTTPS
    const workerSrc = pdfWorkerSrc || `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
  }, [pdfWorkerSrc]);
  
  // Calculate the scale factor needed to fit the PDF to the container width
  const calculateFitToWidthScale = async (pdfDoc: pdfjsLib.PDFDocumentProxy) => {
    if (!containerRef.current) return initialScale;
    
    try {
      // Get the first page to determine dimensions
      const page = await pdfDoc.getPage(1);
      const viewport = page.getViewport({ scale: 1.0 }); // Get original size
      
      // Store the original page width
      setOriginalPageWidth(viewport.width);
      
      // Calculate container width (accounting for padding)
      const containerWidth = containerRef.current.clientWidth - 40; // 40px for padding (20px on each side)
      
      // Calculate scale needed to fit the page width to the container
      const scaleFactor = containerWidth / viewport.width;
      
      return scaleFactor;
    } catch (error) {
      console.error('Error calculating fit-to-width scale:', error);
      return initialScale;
    }
  };
  
  // Modified onAnnotationCreate to capture the position when a new annotation is created
  const handleAnnotationCreate = (newAnnotation: Annotation) => {
    // Select the new annotation to display details
    selectAnnotation(newAnnotation);
    
    // Set position for the details dialog to last mouse position
    if (lastMousePosition) {
      setSelectedAnnotationPosition(lastMousePosition);
    }
    
    // Set isNewAnnotation flag to true so details opens in edit mode
    setIsNewAnnotation(true);
    
    // Call the original onAnnotationCreate callback
    if (onAnnotationCreate) {
      onAnnotationCreate(newAnnotation);
    }
  };
  
  const {
    annotations: localAnnotations,
    selectedAnnotation,
    currentMode: localCurrentMode,
    drawingPoints,
    isDrawing,
    startPoint,
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
    onAnnotationCreate: handleAnnotationCreate,
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
    highlightingColor,
    categoryColors,
    customCategories,
    thickness: annotationThickness,
  });

  // Track mouse position for all pointer events
  const trackMousePosition = (e: MouseEvent) => {
    setLastMousePosition({ x: e.clientX, y: e.clientY });
  };
  
  // Add event listener to track mouse position
  useEffect(() => {
    document.addEventListener('mousemove', trackMousePosition);
    return () => {
      document.removeEventListener('mousemove', trackMousePosition);
    };
  }, []);

  // Reset isNewAnnotation when selectedAnnotation changes
  useEffect(() => {
    if (!selectedAnnotation) {
      setIsNewAnnotation(false);
    }
  }, [selectedAnnotation]);

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
        
        // If fitToWidth is enabled, calculate and set the appropriate scale
        if (fitToWidth) {
          const fitScale = await calculateFitToWidthScale(pdfDoc);
          setScale(fitScale);
        }
        
        if (onDocumentLoadSuccess) {
          onDocumentLoadSuccess(pdfDoc.numPages);
        }
      } catch (error) {
        console.error('Error loading PDF document:', error);
      }
    };

    loadDocument();
  }, [url, onDocumentLoadSuccess, fitToWidth, initialScale]);

  // Recalculate scale when window is resized
  useEffect(() => {
    const handleResize = async () => {
      if (fitToWidth && pdfDocument && originalPageWidth && containerRef.current) {
        const containerWidth = containerRef.current.clientWidth - 40; // 40px for padding
        const newScale = containerWidth / originalPageWidth;
        setScale(newScale);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [fitToWidth, pdfDocument, originalPageWidth]);

  useEffect(() => {
    setMode(annotationMode);
  }, [annotationMode, setMode]);

  useEffect(() => {
    // Only set the default category if currentCategory is undefined/null
    // This prevents overriding a user's selection
    if (!currentCategory) {
      setSelectedENEMCategory(customCategories.length > 0 ? customCategories[0].id : Object.values(ENEMCategory)[0]);
    } else {
      setSelectedENEMCategory(currentCategory);
    }
  }, [currentCategory, customCategories]);

  // Log when selected annotation changes
  useEffect(() => {
    console.log('Selected annotation changed:', selectedAnnotation);
  }, [selectedAnnotation]);

  // When the annotation mode changes or we deselect an annotation, reset the position
  useEffect(() => {
    if (currentMode !== AnnotationMode.NONE || !selectedAnnotation) {
      setSelectedAnnotationPosition(null);
    }
  }, [currentMode, selectedAnnotation]);

  // Update thickness when mode changes
  useEffect(() => {
    // Set the appropriate default thickness for the current mode
    const thickness = currentMode === AnnotationMode.DRAWING 
      ? defaultThicknessValues[AnnotationMode.DRAWING] 
      : currentMode === AnnotationMode.HIGHLIGHTING 
        ? defaultThicknessValues[AnnotationMode.HIGHLIGHTING]
        : currentMode === AnnotationMode.RECTANGLE
          ? defaultThicknessValues[AnnotationMode.RECTANGLE]
          : 2;
    
    setAnnotationThickness(thickness);
  }, [currentMode, defaultThicknessValues]);

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

  const handleCategoryChange = (category: CategoryType) => {
    setSelectedENEMCategory(category);
    
    if (onCategoryChange) {
      onCategoryChange(category);
    }
  };

  const handleAnnotationClick = (annotation: Annotation, event?: React.MouseEvent) => {
    // If we have a click event and we're in NONE mode, store the mouse position
    if (event && currentMode === AnnotationMode.NONE) {
      setSelectedAnnotationPosition({ x: event.clientX, y: event.clientY });
    } else {
      setSelectedAnnotationPosition(null);
    }
    
    selectAnnotation(annotation);
  };

  const handleAnnotationUpdate = (id: string, updates: Partial<Annotation>) => {
    console.log('Atualizando anotação:', id, updates);
    updateAnnotation(id, updates);
    
    // Reset isNewAnnotation flag after an update
    setIsNewAnnotation(false);
  };

  const handleCommentSubmit = (content: string) => {
    if (showCommentPopup && selectedAnnotation) {
      handleAnnotationUpdate(selectedAnnotation.id, { content });
      setShowCommentPopup(false);
    }
  };

  const handleAddComment = (point: Point, pageIndex: number) => {
    // point is already in unscaled coordinates thanks to the updated getRelativeCoordinates
    // but the popup needs to appear at the scaled position on screen
    setCommentPosition({
      x: point.x * scale,
      y: point.y * scale
    });
    setShowCommentPopup(true);
  };

  // Handle adding text annotations
  const handleTextClick = (point: Point, pageIndex: number) => {
    if (currentMode === AnnotationMode.TEXT) {
      // Store the original unscaled position for annotation creation
      setTextPosition(point);
      setTextPageIndex(pageIndex);
      setShowTextPopup(true);
    }
  };

  const handleTextSubmit = (text: string) => {
    if (showTextPopup) {
      // Create a rectangle for the text - no need to adjust for scale here
      // since getRelativeCoordinates already adjusts for scale
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
      
      // Set position for the details dialog
      if (lastMousePosition) {
        setSelectedAnnotationPosition(lastMousePosition);
      }
      
      // Set isNewAnnotation flag to true so details opens in edit mode
      setIsNewAnnotation(true);
      
      setShowTextPopup(false);
    }
  };

  const handleTextCancel = () => {
    setShowTextPopup(false);
  };

  // Handle adding pin annotations
  // const handlePinClick = (point: Point, pageIndex: number) => {
  //   if (currentMode === AnnotationMode.PIN) {
  //     // Store the original unscaled position for annotation creation
  //     setPinPosition(point);
  //     setPinPageIndex(pageIndex);
  //     setShowPinPopup(true);
  //   }
  // };

  // const handlePinSubmit = (selectedTags: TagInterface[], content?: string) => {
  //   if (showPinPopup) {
  //     // Create a rectangle for the pin (pins are just points)
  //     // No need to adjust for scale here since getRelativeCoordinates already adjusts for scale
  //     const rect = {
  //       x: pinPosition.x,
  //       y: pinPosition.y,
  //       width: 24, // Width for clickable area
  //       height: 24, // Height for clickable area
  //       pageIndex: pinPageIndex,
  //     };
      
  //     // Get the color (use pin color or first tag's color if available)
  //     const pinAnnotationColor = pinColor;
      
  //     // Create the pin annotation
  //     const newAnnotation = createAnnotation(AnnotationType.PIN, rect, content || '');
      
  //     // Update the annotation with tags and color
  //     updateAnnotation(newAnnotation.id, {
  //       tags: selectedTags,
  //       color: pinAnnotationColor,
  //     });
      
  //     // Set position for the details dialog
  //     if (lastMousePosition) {
  //       setSelectedAnnotationPosition(lastMousePosition);
  //     }
      
  //     // Set isNewAnnotation flag to true so details opens in edit mode
  //     setIsNewAnnotation(true);
      
  //     setShowPinPopup(false);
  //   }
  // };

  // const handlePinCancel = () => {
  //   setShowPinPopup(false);
  // };

  const handleScaleChange = (newScale: number) => {
    setScale(newScale);
  };

  // Function to fit PDF to viewport width
  const handleFitToWidth = async () => {
    if (pdfDocument && containerRef.current) {
      const fitScale = await calculateFitToWidthScale(pdfDocument);
      setScale(fitScale);
    }
  };

  const handleThicknessChange = (thickness: number) => {
    setAnnotationThickness(thickness);
    
    // Update the default thickness for the current mode
    if (currentMode === AnnotationMode.DRAWING) {
      defaultThicknessValues[AnnotationMode.DRAWING] = thickness;
    } else if (currentMode === AnnotationMode.HIGHLIGHTING) {
      defaultThicknessValues[AnnotationMode.HIGHLIGHTING] = thickness;
    } else if (currentMode === AnnotationMode.RECTANGLE) {
      defaultThicknessValues[AnnotationMode.RECTANGLE] = thickness;
    }
  };

  const renderPages = () => {
    if (!pdfDocument) return null;

    const pages = [];
    for (let i = 1; i <= numPages; i++) {
      if (i === currentPage || i === currentPage - 1 || i === currentPage + 1) {
        // Determine the color to use for drawing preview based on the current mode
        const activeColor = currentMode === AnnotationMode.HIGHLIGHTING 
          ? highlightingColor 
          : currentMode === AnnotationMode.RECTANGLE
            ? rectangleColor || 'rgba(255, 0, 0, 0.7)'
            : drawingColor;

        pages.push(
          <PdfPage
            key={i}
            pdfDocument={pdfDocument}
            pageNumber={i}
            scale={scale}
            annotations={localAnnotations.filter(a => a.pageIndex === i - 1)}
            onAnnotationClick={handleAnnotationClick}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onCommentAdd={handleAddComment}
            onTextClick={handleTextClick}
            activeDrawingPoints={drawingPoints}
            isDrawing={isDrawing}
            drawingColor={activeColor}
            drawingThickness={annotationThickness}
            selectedAnnotation={selectedAnnotation}
            currentMode={currentMode}
            startPoint={startPoint}
            forceRotation={0} // Force rotation to 0 to prevent upside-down PDF rendering
          />
        );
      }
    }
    return pages;
  };

  // Helper function to get the color for a specific annotation type
  const getAnnotationTypeColor = (type: AnnotationType): string => {
    // If we have a selected category, use its color
    if (selectedENEMCategory) {
      if (customCategories) {
        const customCategory = customCategories.find(c => c.id === selectedENEMCategory);
        if (customCategory) {
          return customCategory.color;
        }
      }
      
      // Check if it's a built-in category
      if (categoryColors && typeof categoryColors === 'object') {
        const catKey = String(selectedENEMCategory);
        if (catKey in categoryColors) {
          return categoryColors[catKey];
        }
      }
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
      // case AnnotationType.PIN:
      //   return pinColor;
      default:
        return 'rgba(0, 0, 0, 1)';
    }
  };

  // Helper function to check if a CategoryType is an ENEMCategory
  const isENEMCategory = (category: CategoryType | undefined): category is ENEMCategory | undefined => {
    if (!category) return true; // undefined is valid for both types
    return Object.values(ENEMCategory).includes(category as ENEMCategory);
  };

  return (
    <div className="pdf-annotator bg-gray-100 min-h-screen">
      <ToolBar
        currentMode={currentMode}
        onModeChange={handleAnnotationModeChange}
        currentPage={currentPage}
        numPages={numPages}
        onPageChange={handlePageChange}
        currentCategory={selectedENEMCategory}
        onCategoryChange={handleCategoryChange}
        categoryColors={categoryColors as Record<string, string>}
        customCategories={customCategories}
        scale={scale}
        onScaleChange={handleScaleChange}
        onFitToWidth={handleFitToWidth}
        currentThickness={annotationThickness}
        onThicknessChange={handleThicknessChange}
      />
      
      <div className="overflow-auto flex flex-col items-center" ref={containerRef}>
        {renderPages()}
      </div>

      {/* Annotation Details Panel when an annotation is selected */}
      {selectedAnnotation && (
        <AnnotationDetails
          key={`annotation-details-${selectedAnnotation.id}-${selectedAnnotation.updatedAt?.getTime() || 0}`}
          annotation={selectedAnnotation}
          onClose={() => selectAnnotation(null)}
          onUpdate={handleAnnotationUpdate}
          onDelete={deleteAnnotation}
          position={selectedAnnotationPosition || undefined}
          isNew={isNewAnnotation}
          customCategories={customCategories}
          categoryColors={categoryColors}
          availableTags={availableTags}
        />
      )}

      {/* Comment Popup */}
      {showCommentPopup && (
        <CommentPopup
          position={commentPosition}
          onSubmit={handleCommentSubmit}
          onCancel={() => setShowCommentPopup(false)}
        />
      )}

      {/* Text Input Popup */}
      {showTextPopup && (
        <TextInputPopup
          position={{
            x: textPosition.x * scale,
            y: textPosition.y * scale
          }}
          onSubmit={handleTextSubmit}
          onCancel={handleTextCancel}
        />
      )}

      {/* Pin Popup */}
      {/* TODO: Add Pin Popup */}
    </div>
  );
});

// Helper function for getting annotations JSON without ref
export const getAnnotationsJSON = (annotations: Annotation[]): string => {
  return annotationsToJSON(annotations);
}; 