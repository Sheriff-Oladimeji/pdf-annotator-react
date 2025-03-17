import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Annotation, 
  AnnotationMode, 
  AnnotationType, 
  AnnotationRect, 
  Point,
  ENEMCategory,
  AnnotationEventCallbacks,
  CategoryType,
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
  currentCategory?: CategoryType;
  highlightColor?: string;
  underlineColor?: string;
  strikeoutColor?: string;
  rectangleColor?: string;
  drawingColor?: string;
  textColor?: string;
  commentColor?: string;
  pinColor?: string;
  highlightingColor?: string;
  categoryColors?: Record<string, string>;
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
  categoryColors,
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
    (type: AnnotationType, category?: CategoryType): string => {
      // If a category is provided, use its color
      if (category) {
        return getCategoryColor(category, categoryColors, customCategories);
      }
      
      // Otherwise, fall back to the default color for the annotation type
      return getAnnotationColor(
        type,
        highlightColor,
        underlineColor,
        strikeoutColor,
        rectangleColor,
        drawingColor,
        textColor,
        commentColor,
        pinColor,
        highlightingColor
      );
    },
    [
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
      customCategories
    ]
  );

  const createAnnotation = useCallback(
    (
      type: AnnotationType,
      rect: AnnotationRect,
      content?: string,
      points?: Point[]
    ): Annotation => {
      const color = getColor(type, currentCategory);
      
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
        thickness: thickness
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
            const updatedAnnotation = {
              ...annotation,
              ...updates,
              updatedAt: new Date(),
            };
            console.log('Updated annotation:', updatedAnnotation);
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

      if (annotationType === AnnotationType.DRAWING || annotationType === AnnotationType.HIGHLIGHTING) {
        setIsDrawing(true);
        setDrawingPoints([point]);
      } else {
        setStartPoint(point);
      }
    },
    [currentMode]
  );

  const handlePointerMove = useCallback(
    (point: Point, pageIndex: number): void => {
      if ((currentMode === AnnotationMode.DRAWING || currentMode === AnnotationMode.HIGHLIGHTING) && isDrawing) {
        setDrawingPoints((prev) => {
          return prev.concat([point]);
        });
      }
    },
    [currentMode, isDrawing]
  );

  const handlePointerUp = useCallback(
    (point: Point, pageIndex: number): void => {
      if (currentMode === AnnotationMode.NONE) return;
      
      const annotationType = annotationModeToType(currentMode);
      if (!annotationType) return;

      if ((annotationType === AnnotationType.DRAWING || annotationType === AnnotationType.HIGHLIGHTING) && isDrawing) {
        // Finish drawing
        setIsDrawing(false);
        
        if (drawingPoints.length < 2) return;
        
        // Calculate bounding box of the drawing
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
        // Create annotation based on start and end points
        const rect = calculateRectFromPoints(startPoint, point, pageIndex);
        
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