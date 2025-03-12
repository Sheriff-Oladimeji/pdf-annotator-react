import React, { useEffect, useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PdfPage } from './PdfPage';
import { ToolBar } from './ToolBar';
import { CommentPopup } from './CommentPopup';
import { useAnnotations } from '../hooks/useAnnotations';
import { PDFAnnotatorProps, Annotation, AnnotationMode, Point } from '../types';
import { AnnotationDetails } from './AnnotationDetails';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export const PdfAnnotator: React.FC<PDFAnnotatorProps> = ({
  url,
  annotations = [],
  scale = 1.0,
  pageNumber = 1,
  onDocumentLoadSuccess,
  onPageChange,
  annotationMode = AnnotationMode.NONE,
  onAnnotationModeChange,
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
}) => {
  const [pdfDocument, setPdfDocument] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(pageNumber);
  const [showCommentPopup, setShowCommentPopup] = useState<boolean>(false);
  const [commentPosition, setCommentPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    annotations: localAnnotations,
    selectedAnnotation,
    currentMode,
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
  });

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

  const handleAnnotationClick = (annotation: Annotation) => {
    selectAnnotation(annotation);
  };

  const handleCommentSubmit = (content: string) => {
    // Find the currently selected annotation if any
    if (selectedAnnotation) {
      updateAnnotation(selectedAnnotation.id, { content });
    }
    setShowCommentPopup(false);
  };

  const handleAddComment = (point: Point, pageIndex: number) => {
    if (currentMode === AnnotationMode.COMMENT) {
      setCommentPosition({ x: point.x, y: point.y });
      setShowCommentPopup(true);
    }
  };

  const renderPages = () => {
    if (!pdfDocument) return null;

    const pages = [];
    for (let i = 1; i <= numPages; i++) {
      pages.push(
        <PdfPage
          key={i}
          pdfDocument={pdfDocument}
          pageNumber={i}
          scale={scale}
          annotations={localAnnotations}
          onAnnotationClick={handleAnnotationClick}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
      );
    }
    return pages;
  };

  return (
    <div className="pdf-annotator-container" ref={containerRef}>
      <ToolBar
        currentMode={currentMode}
        onModeChange={handleAnnotationModeChange}
        currentPage={currentPage}
        numPages={numPages}
        onPageChange={handlePageChange}
      />
      
      <div className="pdf-annotator-content">
        <div className="pdf-annotator-pages">{renderPages()}</div>
        
        {selectedAnnotation && (
          <AnnotationDetails
            annotation={selectedAnnotation}
            onUpdate={updateAnnotation}
            onDelete={deleteAnnotation}
            onClose={() => selectAnnotation(null)}
          />
        )}
      </div>
      
      {showCommentPopup && (
        <CommentPopup
          position={commentPosition}
          onSubmit={handleCommentSubmit}
          onCancel={() => setShowCommentPopup(false)}
        />
      )}
    </div>
  );
}; 