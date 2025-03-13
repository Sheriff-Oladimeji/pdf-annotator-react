// Export main components
export { PdfAnnotator } from './components/PdfAnnotator';

// Export enums as values
export { AnnotationMode, AnnotationType } from './types';

// Export types
export type {
  Annotation,
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