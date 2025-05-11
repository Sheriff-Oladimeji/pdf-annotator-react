import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  Annotation, 
  AnnotationMode, 
  AnnotationType, 
  AnnotationRect, 
  Point,
  AnnotationEventCallbacks,
} from '../types';
import { 
  annotationModeToType, 
  calculateRectFromPoints, 
  getAnnotationColor, 
  getCategoryColor 
} from '../utils';
import { CompetenciaInterface } from 'lingapp-revisao-redacao';

interface UseAnnotationsProps extends AnnotationEventCallbacks {
  initialAnnotations?: Annotation[];
  annotationMode?: AnnotationMode;
  currentCategory?: CompetenciaInterface;
  highlightColor?: string;
  underlineColor?: string;
  strikeoutColor?: string;
  rectangleColor?: string;
  drawingColor?: string;
  textColor?: string;
  commentColor?: string;
  pinColor?: string;
  highlightingColor?: string;
  customCategories?: CompetenciaInterface[];
  thickness?: number;
}

// Helper function to generate MongoDB-like ObjectId
const generateMongoLikeId = (): string => {
  // ObjectId format: 24 hex chars (12 bytes)
  // Format: 4 bytes timestamp + 5 bytes random + 3 bytes counter
  
  // Get current timestamp (4 bytes - 8 hex chars)
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  
  // Generate random part (16 hex chars to make 24 total)
  const random = uuidv4().replace(/-/g, '').substring(0, 16);
  
  return timestamp + random;
};

export const useAnnotations = ({
  initialAnnotations = [],
  annotationMode = AnnotationMode.NONE,
  currentCategory,
  onAnnotationCreate,
  onAnnotationUpdate,
  onAnnotationDelete,
  onAnnotationSelect,
  // highlightColor,
  // underlineColor,
  // strikeoutColor,
  // rectangleColor,
  // drawingColor,
  // textColor,
  // commentColor,
  // pinColor,
  // highlightingColor,
  // customCategories = [],
  thickness = 2,
}: UseAnnotationsProps) => {
  const [annotations, setAnnotations] = useState<Annotation[]>(initialAnnotations);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [currentMode, setCurrentMode] = useState<AnnotationMode>(annotationMode);
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [pendingPencilAnnotation, setPendingPencilAnnotation] = useState<{
    points: Point[];
    pageIndex: number;
    rect: AnnotationRect;
  } | null>(null);

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
        id: generateMongoLikeId(),
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
      // console.log('useAnnotations updateAnnotation:', id, updates);
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
            // console.log('Updated annotation with new color:', updatedAnnotation.color);
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
        
        // Only immediately create annotation for highlighting, not for drawing (pencil)
        if (annotationType === AnnotationType.HIGHLIGHTING) {
          createAnnotation(annotationType, rect, undefined, drawingPoints);
          setDrawingPoints([]);
        } else if (annotationType === AnnotationType.DRAWING) {
          // For pencil drawing, store as pending until the user confirms
          setPendingPencilAnnotation({
            points: [...drawingPoints],
            pageIndex,
            rect
          });
          // Keep the drawing points to display the pending annotation
        }
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

  const validatePencilAnnotation = useCallback(() => {
    if (pendingPencilAnnotation) {
      const { points, rect, pageIndex } = pendingPencilAnnotation;
      createAnnotation(AnnotationType.DRAWING, rect, undefined, points);
      setPendingPencilAnnotation(null);
      setDrawingPoints([]);
    }
  }, [pendingPencilAnnotation, createAnnotation]);

  const cancelPencilAnnotation = useCallback(() => {
    setPendingPencilAnnotation(null);
    setDrawingPoints([]);
  }, []);

  return {
    annotations,
    selectedAnnotation,
    currentMode,
    drawingPoints,
    isDrawing,
    startPoint,
    pendingPencilAnnotation,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
    selectAnnotation,
    setMode,
    validatePencilAnnotation,
    cancelPencilAnnotation,
  };
};