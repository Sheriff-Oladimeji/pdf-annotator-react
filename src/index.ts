// Export main components
export { PdfAnnotator } from './components/PdfAnnotator';

// Export types
export type {
  Annotation,
  AnnotationType,
  AnnotationMode,
  AnnotationRect,
  Point,
  AnnotationEventCallbacks,
  PDFAnnotatorProps,
} from './types';

// Export utilities
export {
  createAnnotation,
  getAnnotationColor,
  annotationModeToType,
  calculateRectFromPoints,
  pointsToSvgPath,
} from './utils';

// Export hooks
export { useAnnotations } from './hooks/useAnnotations'; 