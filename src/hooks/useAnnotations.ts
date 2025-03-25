import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Annotation, 
  AnnotationMode, 
  AnnotationType, 
  AnnotationRect, 
  Point,
  AnnotationEventCallbacks,
  CategoryItem
} from '../types';
import { 
  annotationModeToType, 
  calculateRectFromPoints, 
  getAnnotationColor, 
  getCategoryColor 
} from '../utils';

interface UseAnnotationsProps extends AnnotationEventCallbacks {
  initialAnnotations?: Annotation[];
  annotationMode?: AnnotationMode;
  currentCategory?: CategoryItem;
  highlightColor?: string;
  underlineColor?: string;
  strikeoutColor?: string;
  rectangleColor?: string;
  drawingColor?: string;
  textColor?: string;
  commentColor?: string;
  pinColor?: string;
  highlightingColor?: string;
  customCategories?: CategoryItem[];
  thickness?: number;
}

export const useAnnotations = ({
  initialAnnotations = [],
  annotationMode = AnnotationMode.NONE,
  currentCategory,
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
  highlightingColor,
  customCategories = [],
  thickness = 2,
}: UseAnnotationsProps) => {
  const [annotations, setAnnotations] = useState<Annotation[]>(initialAnnotations);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [currentMode, setCurrentMode] = useState<AnnotationMode>(annotationMode);
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);

  const getColor = useCallback(
    (type: AnnotationType): string => {
      // If a category is provided, use its color
      if (currentCategory) {
        return currentCategory.color;
      }
      
      // Otherwise, fall back to the default color for the annotation type
      return getAnnotationColor(type);
    },
    [currentCategory]
  );

  const createAnnotation = useCallback(
    (
      type: AnnotationType,
      rect: AnnotationRect,
      content?: string,
      points?: Point[]
    ): Annotation => {
      const color = getColor(type);
      
      const newAnnotation: Annotation = {
        id: uuidv4(),
        type,
        rect,
        pageIndex: rect.pageIndex,
        color,
        content: content || '',
        points,
        createdAt: new Date(),
        updatedAt: new Date(),
        thickness: thickness,
        category: currentCategory
      };
      
      setAnnotations((prev) => [...prev, newAnnotation]);
      
      if (onAnnotationCreate) {
        onAnnotationCreate(newAnnotation);
      }
      
      return newAnnotation;
    },
    [currentCategory, getColor, onAnnotationCreate, thickness]
  );

  const updateAnnotation = useCallback(
    (id: string, updates: Partial<Annotation>): void => {
      console.log('useAnnotations updateAnnotation:', id, updates);
      setAnnotations((prev) => {
        const updated = prev.map((annotation) => {
          if (annotation.id === id) {
            // Ensure color is updated if category changes
            let updatedColor = updates.color;
            if (updates.category && !updatedColor) {
              updatedColor = updates.category.color;
            }

            const updatedAnnotation = {
              ...annotation,
              ...updates,
              color: updatedColor || annotation.color, // Ensure color is properly updated
              updatedAt: new Date(),
            };
            console.log('Updated annotation with new color:', updatedAnnotation.color);
            // Call the callback if provided
            onAnnotationUpdate?.(updatedAnnotation);
            
            // If this is the currently selected annotation, update the selection too
            if (selectedAnnotation && selectedAnnotation.id === id) {
              setSelectedAnnotation(updatedAnnotation);
            }
            
            return updatedAnnotation;
          }
          return annotation;
        });
        return updated;
      });
    },
    [onAnnotationUpdate, selectedAnnotation]
  );

  const deleteAnnotation = useCallback(
    (id: string): void => {
      setAnnotations((prev) => prev.filter((annotation) => annotation.id !== id));
      if (selectedAnnotation?.id === id) {
        setSelectedAnnotation(null);
        onAnnotationSelect?.(null);
      }
      onAnnotationDelete?.(id);
    },
    [selectedAnnotation, onAnnotationDelete, onAnnotationSelect]
  );

  const selectAnnotation = useCallback(
    (annotation: Annotation | null): void => {
      setSelectedAnnotation(annotation);
      onAnnotationSelect?.(annotation);
    },
    [onAnnotationSelect]
  );

  const setMode = useCallback((mode: AnnotationMode): void => {
    setCurrentMode(mode);
    // Reset drawing state when changing modes
    setIsDrawing(false);
    setDrawingPoints([]);
    setStartPoint(null);
  }, []);

  const handlePointerDown = useCallback(
    (point: Point, pageIndex: number): void => {
      if (currentMode === AnnotationMode.NONE) return;
      
      const annotationType = annotationModeToType(currentMode);
      if (!annotationType) return;

      // Store the original point without any modification
      const originalPoint = { ...point };

      if (annotationType === AnnotationType.DRAWING || annotationType === AnnotationType.HIGHLIGHTING) {
        setIsDrawing(true);
        setDrawingPoints([originalPoint]);
      } else {
        setStartPoint(originalPoint);
      }
    },
    [currentMode]
  );

  const handlePointerMove = useCallback(
    (point: Point, pageIndex: number): void => {
      if ((currentMode === AnnotationMode.DRAWING || currentMode === AnnotationMode.HIGHLIGHTING) && isDrawing) {
        // Add the point without any modification
        const originalPoint = { ...point };
        setDrawingPoints((prev) => {
          return prev.concat([originalPoint]);
        });
      }
    },
    [currentMode, isDrawing]
  );

  const calculateRectFromNormalizedPoints = (start: Point, end: Point, pageIndex: number): AnnotationRect => {
    // Points are already in normalized coordinates (0-1 range)
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);
    
    return {
      x,
      y,
      width,
      height,
      pageIndex,
    };
  };

  const handlePointerUp = useCallback(
    (point: Point, pageIndex: number): void => {
      if (currentMode === AnnotationMode.NONE) return;
      
      const annotationType = annotationModeToType(currentMode);
      if (!annotationType) return;

      // Use the original point without any modification
      const originalPoint = { ...point };

      if ((annotationType === AnnotationType.DRAWING || annotationType === AnnotationType.HIGHLIGHTING) && isDrawing) {
        // Finish drawing
        setIsDrawing(false);
        
        if (drawingPoints.length < 2) return;
        
        // Calculate bounding box of the drawing - now all coordinates are already normalized (0-1)
        let minX = Number.MAX_VALUE;
        let minY = Number.MAX_VALUE;
        let maxX = Number.MIN_VALUE;
        let maxY = Number.MIN_VALUE;
        
        for (const point of drawingPoints) {
          minX = Math.min(minX, point.x);
          minY = Math.min(minY, point.y);
          maxX = Math.max(maxX, point.x);
          maxY = Math.max(maxY, point.y);
        }
        
        const rect: AnnotationRect = {
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY,
          pageIndex,
        };
        
        createAnnotation(annotationType, rect, undefined, drawingPoints);
        setDrawingPoints([]);
      } else if (startPoint) {
        // Create annotation based on start and end points - using normalized coordinates
        const rect = calculateRectFromNormalizedPoints(startPoint, originalPoint, pageIndex);
        
        if (rect.width > 0 && rect.height > 0) {
          createAnnotation(annotationType, rect);
        }
        
        setStartPoint(null);
      }
    },
    [currentMode, isDrawing, drawingPoints, startPoint, createAnnotation]
  );

  return {
    annotations,
    selectedAnnotation,
    currentMode,
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
  };
};