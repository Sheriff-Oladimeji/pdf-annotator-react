import React, { useRef, useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { AnnotationLayer } from './AnnotationLayer';
import { Annotation, Point, AnnotationMode } from '../types';

interface PdfPageProps {
  pdfDocument: pdfjsLib.PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  annotations: Annotation[];
  onAnnotationClick?: (annotation: Annotation) => void;
  onPointerDown?: (point: Point, pageIndex: number) => void;
  onPointerMove?: (point: Point, pageIndex: number) => void;
  onPointerUp?: (point: Point, pageIndex: number) => void;
  onCommentAdd?: (point: Point, pageIndex: number) => void;
  onTextClick?: (point: Point, pageIndex: number) => void;
  activeDrawingPoints?: Point[];
  isDrawing?: boolean;
  drawingColor?: string;
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
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageHeight, setPageHeight] = useState<number>(0);
  const [pageWidth, setPageWidth] = useState<number>(0);
  const [isRendered, setIsRendered] = useState<boolean>(false);

  useEffect(() => {
    const renderPage = async () => {
      if (!canvasRef.current) return;

      try {
        const page = await pdfDocument.getPage(pageNumber);
        const viewport = page.getViewport({ scale });
        
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        
        if (!context) return;
        
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        setPageHeight(viewport.height);
        setPageWidth(viewport.width);
        
        const renderContext = {
          canvasContext: context,
          viewport,
        };
        
        await page.render(renderContext).promise;
        setIsRendered(true);
      } catch (error) {
        console.error('Error rendering PDF page:', error);
      }
    };

    renderPage();
  }, [pdfDocument, pageNumber, scale]);

  const getRelativeCoordinates = (event: React.PointerEvent): Point => {
    if (!containerRef.current) return { x: 0, y: 0 };
    
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
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
    if (onTextClick) {
      onTextClick(point, pageNumber - 1);
    }
  };

  // Handle right-click for comment adding
  const handleContextMenu = (event: React.MouseEvent) => {
    if (!onCommentAdd) return;
    
    event.preventDefault();
    const point = {
      x: event.clientX - (containerRef.current?.getBoundingClientRect().left || 0),
      y: event.clientY - (containerRef.current?.getBoundingClientRect().top || 0),
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
        />
      )}
    </div>
  );
}; 