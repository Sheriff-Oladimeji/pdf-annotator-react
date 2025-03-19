import React, { useRef, useEffect, useState } from 'react';
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

  useEffect(() => {
    let isMounted = true;
    
    const renderPage = async () => {
      if (!canvasRef.current || !isMounted) return;

      try {
        // Cancel any existing render tasks
        if (renderTaskRef.current) {
          await renderTaskRef.current.cancel();
          renderTaskRef.current = null;
        }
        
        // Set rendered state to false to hide annotation layer during re-render
        setIsRendered(false);
        
        // Get the page
        const page = await pdfDocument.getPage(pageNumber);
        const viewport = page.getViewport({ 
          scale, 
          rotation: forceRotation !== null ? forceRotation : undefined 
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
        
        const renderContext = {
          canvasContext: context,
          viewport,
          enableWebGL: true,
        };
        
        // Store the render task reference
        renderTaskRef.current = page.render(renderContext);
        
        // Wait for the render to complete
        await renderTaskRef.current.promise;
        
        // If still mounted, mark as rendered
        if (isMounted) {
          setIsRendered(true);
          renderTaskRef.current = null;
        }
      } catch (error) {
        // Only log errors if they're not cancellation errors
        if (error instanceof Error && error.message !== 'Rendering cancelled') {
          console.error('Error rendering PDF page:', error);
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
  }, [pdfDocument, pageNumber, scale, forceRotation]);

  const getRelativeCoordinates = (event: React.PointerEvent): Point => {
    if (!containerRef.current) return { x: 0, y: 0 };
    
    const rect = containerRef.current.getBoundingClientRect();
    // Get the coordinates relative to the container
    const relativeX = event.clientX - rect.left;
    const relativeY = event.clientY - rect.top;
    
    // Transform the coordinates according to the current scale
    // This ensures that we store coordinates in the unscaled coordinate system
    return {
      x: relativeX / scale,
      y: relativeY / scale,
    };
  };

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
  const handleContextMenu = (event: React.MouseEvent) => {
    if (!onCommentAdd) return;
    
    event.preventDefault();
    const point = {
      x: (event.clientX - (containerRef.current?.getBoundingClientRect().left || 0)) / scale,
      y: (event.clientY - (containerRef.current?.getBoundingClientRect().top || 0)) / scale,
    };
    onCommentAdd(point, pageNumber - 1);
  };

  return (
    <div 
      className="relative mb-8 bg-white shadow-xl rounded-sm border border-gray-300"
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onContextMenu={handleContextMenu}
      style={{
        // Add a subtle page curl effect with box-shadow
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24), 0 10px 20px rgba(0,0,0,0.15)'
      }}
    >
      <div className="absolute top-0 right-0 px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-bl-md border-l border-b border-gray-300">
        Page {pageNumber}
      </div>
      
      <canvas
        ref={canvasRef}
        className="block"
        width={pageWidth || 1}
        height={pageHeight || 1}
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
          drawingThickness={drawingThickness}
          selectedAnnotation={selectedAnnotation}
          currentMode={currentMode}
          startPoint={startPoint}
        />
      )}
    </div>
  );
}; 