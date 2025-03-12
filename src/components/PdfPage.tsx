import React, { useRef, useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { AnnotationLayer } from './AnnotationLayer';
import { Annotation, Point } from '../types';

interface PdfPageProps {
  pdfDocument: pdfjsLib.PDFDocumentProxy;
  pageNumber: number;
  scale: number;
  annotations: Annotation[];
  onAnnotationClick?: (annotation: Annotation) => void;
  onPointerDown?: (point: Point, pageIndex: number) => void;
  onPointerMove?: (point: Point, pageIndex: number) => void;
  onPointerUp?: (point: Point, pageIndex: number) => void;
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
  };

  return (
    <div 
      className="pdf-annotator-page-container"
      style={{ 
        position: 'relative',
        marginBottom: '10px',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
      }}
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <canvas
        ref={canvasRef}
        className="pdf-annotator-page-canvas"
        style={{ display: 'block' }}
      />
      {isRendered && (
        <AnnotationLayer
          annotations={annotations}
          pageIndex={pageNumber - 1}
          scale={scale}
          onAnnotationClick={onAnnotationClick}
        />
      )}
    </div>
  );
}; 