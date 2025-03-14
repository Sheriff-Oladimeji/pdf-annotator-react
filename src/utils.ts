import { Annotation, AnnotationMode, AnnotationRect, AnnotationType, Point, ENEMCategory } from './types';
import { v4 as uuidv4 } from 'uuid';

export const createAnnotation = (
  type: AnnotationType,
  rect: AnnotationRect,
  pageIndex: number,
  color?: string,
  content?: string,
  points?: Point[]
): Annotation => {
  return {
    id: uuidv4(),
    type,
    rect,
    pageIndex,
    color,
    content,
    points,
    createdAt: new Date(),
  };
};

export const getAnnotationColor = (
  type: AnnotationType,
  highlightColor?: string,
  underlineColor?: string,
  strikeoutColor?: string,
  rectangleColor?: string,
  drawingColor?: string,
  textColor?: string,
  commentColor?: string,
  pinColor?: string
): string => {
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
      return pinColor || 'rgba(249, 115, 22, 0.7)'; // Default orange
    default:
      return 'rgba(0, 0, 0, 1)';
  }
};

export const annotationModeToType = (mode: AnnotationMode): AnnotationType | null => {
  switch (mode) {
    case AnnotationMode.HIGHLIGHT:
      return AnnotationType.HIGHLIGHT;
    case AnnotationMode.UNDERLINE:
      return AnnotationType.UNDERLINE;
    case AnnotationMode.STRIKEOUT:
      return AnnotationType.STRIKEOUT;
    case AnnotationMode.RECTANGLE:
      return AnnotationType.RECTANGLE;
    case AnnotationMode.DRAWING:
      return AnnotationType.DRAWING;
    case AnnotationMode.TEXT:
      return AnnotationType.TEXT;
    case AnnotationMode.COMMENT:
      return AnnotationType.COMMENT;
    case AnnotationMode.PIN:
      return AnnotationType.PIN;
    default:
      return null;
  }
};

export const calculateRectFromPoints = (
  startPoint: Point,
  endPoint: Point,
  pageIndex: number
): AnnotationRect => {
  const x = Math.min(startPoint.x, endPoint.x);
  const y = Math.min(startPoint.y, endPoint.y);
  const width = Math.abs(endPoint.x - startPoint.x);
  const height = Math.abs(endPoint.y - startPoint.y);

  return { x, y, width, height, pageIndex };
};

export const pointsToSvgPath = (points: Point[]): string => {
  if (points.length === 0) return '';
  
  let path = `M ${points[0].x} ${points[0].y}`;
  
  for (let i = 1; i < points.length; i++) {
    path += ` L ${points[i].x} ${points[i].y}`;
  }
  
  return path;
};

// Default ENEM category colors
export const DEFAULT_CATEGORY_COLORS: Record<ENEMCategory, string> = {
  [ENEMCategory.COMPETENCIA1]: 'rgba(255, 0, 0, 0.7)',     // Red
  [ENEMCategory.COMPETENCIA2]: 'rgba(0, 176, 80, 0.7)',    // Green
  [ENEMCategory.COMPETENCIA3]: 'rgba(0, 112, 192, 0.7)',   // Blue
  [ENEMCategory.COMPETENCIA4]: 'rgba(255, 192, 0, 0.7)',   // Yellow
  [ENEMCategory.COMPETENCIA5]: 'rgba(112, 48, 160, 0.7)',  // Purple
};

// Get color based on category
export const getCategoryColor = (
  category: ENEMCategory | undefined,
  categoryColors?: Record<ENEMCategory, string>
): string => {
  if (!category) return 'rgba(0, 0, 0, 1)';
  
  return (categoryColors && categoryColors[category]) || 
         DEFAULT_CATEGORY_COLORS[category] || 
         'rgba(0, 0, 0, 1)';
};

// Get category name for display
export const getCategoryDisplayName = (category: ENEMCategory): string => {
  switch (category) {
    case ENEMCategory.COMPETENCIA1:
      return 'Competência 1 - Domínio da norma padrão';
    case ENEMCategory.COMPETENCIA2:
      return 'Competência 2 - Compreensão da proposta';
    case ENEMCategory.COMPETENCIA3:
      return 'Competência 3 - Argumentação';
    case ENEMCategory.COMPETENCIA4:
      return 'Competência 4 - Mecanismos linguísticos';
    case ENEMCategory.COMPETENCIA5:
      return 'Competência 5 - Proposta de intervenção';
    default:
      return 'Desconhecido';
  }
};

// Format annotations to JSON
export const annotationsToJSON = (annotations: Annotation[]): string => {
  return JSON.stringify(annotations.map(annotation => ({
    ...annotation,
    createdAt: annotation.createdAt.toISOString(),
    updatedAt: annotation.updatedAt ? annotation.updatedAt.toISOString() : undefined
  })), null, 2);
}; 