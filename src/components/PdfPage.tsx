import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { AnnotationLayer } from './AnnotationLayer';
import { Annotation, Point, AnnotationMode } from '../types';

interface PdfPageProps {
  pdfDocument: pdfjsLib.PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  annotations: Annotation[];
  onAnnotationClick?: (annotation: Annotation, event?: React.MouseEvent) => void;
  onPointerDown?: (point: Point, pageIndex: number) => void;
  onPointerMove?: (point: Point, pageIndex: number) => void;
  onPointerUp?: (point: Point, pageIndex: number) => void;
  onCommentAdd?: (point: Point, pageIndex: number) => void;
  onTextClick?: (point: Point, pageIndex: number) => void;
  activeDrawingPoints?: Point[];
  isDrawing?: boolean;
  drawingColor?: string;
  drawingThickness?: number;
  selectedAnnotation?: Annotation | null;
  currentMode?: AnnotationMode;
  startPoint?: Point | null;
  forceRotation?: number;
}

export const PdfPage: React.FC<PdfPageProps> = ({
  pdfDocument,
  pageNumber,
  scale,
  annotations,
  onAnnotationClick,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onCommentAdd,
  onTextClick,
  activeDrawingPoints = [],
  isDrawing = false,
  drawingColor,
  drawingThickness,
  selectedAnnotation = null,
  currentMode = AnnotationMode.NONE,
  startPoint = null,
  forceRotation = null,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageHeight, setPageHeight] = useState<number>(0);
  const [pageWidth, setPageWidth] = useState<number>(0);
  const [isRendered, setIsRendered] = useState<boolean>(false);
  const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);
  const [viewportDimensions, setViewportDimensions] = useState<{width: number, height: number}>({width: 0, height: 0});
  // Track actual canvas dimensions to handle window resizing
  const [canvasDimensions, setCanvasDimensions] = useState<{width: number, height: number}>({width: 0, height: 0});
  // Reference to most recent viewport for coordinate calculations
  const viewportRef = useRef<pdfjsLib.PageViewport | null>(null);
  // Add state to track original PDF page dimensions at scale 1.0
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number, height: number }>({ width: 0, height: 0 });
  const [renderError, setRenderError] = useState<string | null>(null);
  const [renderAttempts, setRenderAttempts] = useState<number>(0);
  const maxRenderAttempts = 3;

  // Function to get canvas dimensions - used for coordinate calculations
  const updateCanvasDimensions = useCallback(() => {
    if (canvasRef.current) {
      const { width, height } = canvasRef.current.getBoundingClientRect();
      setCanvasDimensions({ width, height });
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const renderPage = async () => {
      if (!canvasRef.current || !isMounted) return;

      try {
        // Reset render error on each attempt
        setRenderError(null);
        
        // Cancel any existing render tasks
        if (renderTaskRef.current) {
          await renderTaskRef.current.cancel();
          renderTaskRef.current = null;
        }
        
        // Set rendered state to false to hide annotation layer during re-render
        setIsRendered(false);
        
        // Get the page
        const page = await pdfDocument.getPage(pageNumber);
        
        // Store the original dimensions at scale 1.0
        const originalViewport = page.getViewport({ scale: 1.0 });
        setOriginalDimensions({
          width: originalViewport.width,
          height: originalViewport.height
        });
        
        const viewport = page.getViewport({ 
          scale, 
          rotation: forceRotation !== null ? forceRotation : undefined 
        });
        
        // Store viewport reference for coordinate calculations
        viewportRef.current = viewport;
        
        // Store viewport dimensions for coordinate calculations
        setViewportDimensions({
          width: viewport.width,
          height: viewport.height
        });
        
        // Ensure we're still mounted
        if (!isMounted || !canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d', { alpha: false });
        
        if (!context) return;
        
        // Clear the canvas before rendering
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set canvas dimensions
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        setPageHeight(viewport.height);
        setPageWidth(viewport.width);
        
        // Update canvas dimensions after setting canvas width/height
        updateCanvasDimensions();
        
        const renderContext = {
          canvasContext: context,
          viewport,
          // Try rendering without WebGL first
          enableWebGL: renderAttempts > 0 ? false : true,
        };
        
        // Store the render task reference
        renderTaskRef.current = page.render(renderContext);
        
        // Wait for the render to complete
        await renderTaskRef.current.promise;
        
        // If still mounted, mark as rendered
        if (isMounted) {
          setIsRendered(true);
          renderTaskRef.current = null;
          // Reset render attempts on success
          setRenderAttempts(0);
        }
      } catch (error) {
        // Handle rendering cancelled exception specifically
        if (error instanceof Error) {
          console.warn('PDF rendering error:', error.message);
          setRenderError(error.message);
          
          // If it's a rendering cancelled error and we haven't exceeded max attempts, retry
          if (error.name === 'RenderingCancelledException' && renderAttempts < maxRenderAttempts) {
            if (isMounted) {
              // Increment attempts count
              setRenderAttempts(prev => prev + 1);
              
              // Wait a brief moment before retrying
              setTimeout(() => {
                if (isMounted) {
                  console.log(`Retrying PDF page render (attempt ${renderAttempts + 1}/${maxRenderAttempts})`);
                  // Retry rendering
                  renderPage();
                }
              }, 500);
            }
          } else if (renderAttempts >= maxRenderAttempts) {
            console.error('Max render attempts reached:', error);
            // Still set rendered to true to allow annotation layer to appear
            setIsRendered(true);
          }
        }
      }
    };

    renderPage();

    // Cleanup function
    return () => {
      isMounted = false;
      
      // Cancel any pending render tasks
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [pdfDocument, pageNumber, scale, forceRotation, updateCanvasDimensions, renderAttempts]);

  // Add a useEffect to update coordinates on window resize
  useEffect(() => {
    const handleResize = () => {
      // Update canvas dimensions on resize
      updateCanvasDimensions();
      
      // Force canvas redraw with updated coordinates
      if (canvasRef.current) {
        // Signal that dimensions may have changed
        setIsRendered(false);
        // Trigger re-render after a small delay
        setTimeout(() => {
          setIsRendered(true);
        }, 100);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Also run resize handler on initial mount to ensure dimensions are correct
    handleResize();
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [updateCanvasDimensions]);

  // Enhance the coordinate conversion functions to use normalized coordinates (0-1 range)
  // This ensures annotations work at any zoom level or screen size
  const getRelativeCoordinates = (event: React.MouseEvent | React.PointerEvent): Point => {
    if (!canvasRef.current || originalDimensions.width === 0) {
      return { x: 0, y: 0 };
    }
    
    const rect = canvasRef.current.getBoundingClientRect();
    
    // Calculate coordinates in the current viewport
    const viewportX = (event.clientX - rect.left);
    const viewportY = (event.clientY - rect.top);
    
    // Convert to normalized coordinates (0-1 range) relative to original PDF dimensions
    // First convert viewport coordinates to PDF coordinates by dividing by scale
    const pdfX = viewportX / scale;
    const pdfY = viewportY / scale;
    
    // Then normalize to 0-1 range based on original page dimensions
    const normalizedX = pdfX / originalDimensions.width;
    const normalizedY = pdfY / originalDimensions.height;
    
    // Apply bounds checking to ensure coordinates are within the page (0-1 range)
    const boundedX = Math.max(0, Math.min(normalizedX, 1));
    const boundedY = Math.max(0, Math.min(normalizedY, 1));
    
    // Store original scale with the point for debugging/reference
    return { 
      x: boundedX, 
      y: boundedY
    };
  };

  // This function converts normalized coordinates (0-1) back to viewport coordinates for rendering
  const normalizedToViewportCoordinates = useCallback((normalizedX: number, normalizedY: number): Point => {
    if (!viewportRef.current) {
      return { x: normalizedX, y: normalizedY };
    }
    
    // Convert from normalized (0-1) to PDF coordinates
    const pdfX = normalizedX * originalDimensions.width;
    const pdfY = normalizedY * originalDimensions.height;
    
    // Convert from PDF coordinates to viewport coordinates
    const viewportX = pdfX * scale;
    const viewportY = pdfY * scale;
    
    return { x: viewportX, y: viewportY };
  }, [scale, originalDimensions]);

  // Function to convert screen coordinates to PDF coordinates
  const screenToPdfCoordinates = useCallback((x: number, y: number): Point => {
    if (!canvasRef.current || !viewportRef.current) {
      return { x, y };
    }
    
    const rect = canvasRef.current.getBoundingClientRect();
    // Calculate relative position within the canvas element
    const relativeX = (x - rect.left);
    const relativeY = (y - rect.top);
    
    // Convert to PDF coordinates (which are in the original PDF coordinate system)
    const pdfX = relativeX / scale;
    const pdfY = relativeY / scale;
    
    // Bound the coordinates to the page dimensions
    const viewport = viewportRef.current;
    const boundedX = Math.max(0, Math.min(pdfX, viewport.width / scale));
    const boundedY = Math.max(0, Math.min(pdfY, viewport.height / scale));
    
    return { x: boundedX, y: boundedY };
  }, [scale]);

  const handlePointerDown = (event: React.PointerEvent) => {
    if (!onPointerDown) return;
    
    const point = getRelativeCoordinates(event);
    onPointerDown(point, pageNumber - 1);
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!onPointerMove) return;
    
    const point = getRelativeCoordinates(event);
    onPointerMove(point, pageNumber - 1);
  };

  const handlePointerUp = (event: React.PointerEvent) => {
    if (!onPointerUp) return;
    
    const point = getRelativeCoordinates(event);
    onPointerUp(point, pageNumber - 1);

    // Handle text click if in text mode
    if (onTextClick && currentMode === AnnotationMode.TEXT) {
      onTextClick(point, pageNumber - 1);
    }
  };

  // Handle right-click for comment adding
  // const handleContextMenu = (event: React.MouseEvent) => {
  //   if (!onCommentAdd) return;
    
  //   event.preventDefault();
    
  //   // Use the getRelativeCoordinates function for consistency
  //   const point = getRelativeCoordinates(event);
  //   onCommentAdd(point, pageNumber - 1);
  // };

  return (
    <div 
      ref={containerRef}
      className="relative pdf-page"
      style={{ margin: '0 auto', width: pageWidth, height: pageHeight }}
      data-page-number={pageNumber}
    >
      <canvas
        ref={canvasRef}
        className="pdf-canvas"
        style={{ width: '100%', height: '100%' }}
      />
      
      {isRendered && (
        <AnnotationLayer
          annotations={annotations}
          pageIndex={pageNumber - 1}
          scale={scale}
          onAnnotationClick={onAnnotationClick}
          activeDrawingPoints={activeDrawingPoints}
          isDrawing={isDrawing}
          drawingColor={drawingColor}
          selectedAnnotation={selectedAnnotation}
          currentMode={currentMode}
          originalPageDimensions={originalDimensions}
          viewportToNormalizedCoordinates={getRelativeCoordinates}
          normalizedToViewportCoordinates={normalizedToViewportCoordinates}
        />
      )}
      
      {renderError && renderAttempts >= maxRenderAttempts && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
          <div className="p-4 text-center">
            <p className="font-medium text-red-600">Error rendering PDF page.</p>
            <p className="text-sm text-gray-600">Try refreshing the page or using a different browser.</p>
          </div>
        </div>
      )}
      
      <div
        className="absolute inset-0"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ touchAction: 'none' }} // Prevent default touch actions for better drawing
      />
    </div>
  );
}; 