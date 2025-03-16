import React from 'react';
import { Annotation, AnnotationType, Point } from '../types';
import { pointsToSvgPath } from '../utils';
import { IoInformationCircle } from 'react-icons/io5';
import { FaExclamationCircle } from 'react-icons/fa';

interface AnnotationLayerProps {
  annotations: Annotation[];
  pageIndex: number;
  scale: number;
  onAnnotationClick?: (annotation: Annotation, event?: React.MouseEvent) => void;
  activeDrawingPoints?: Point[];
  isDrawing?: boolean;
  drawingColor?: string;
  selectedAnnotation?: Annotation | null;
}

export const AnnotationLayer: React.FC<AnnotationLayerProps> = ({
  annotations,
  pageIndex,
  scale,
  onAnnotationClick,
  activeDrawingPoints = [],
  isDrawing = false,
  drawingColor = 'rgba(255, 0, 0, 0.7)', // Default red color
  selectedAnnotation = null,
}) => {
  const pageAnnotations = annotations.filter(
    (annotation) => annotation.pageIndex === pageIndex
  );

  // Function to get a representative color for tags
  const getTagColor = (annotation: Annotation): string => {
    if (annotation.color) return annotation.color;
    return '#f97316'; // Orange default for pins
  };

  // Function to check if an annotation is selected
  const isSelected = (annotation: Annotation): boolean => {
    return selectedAnnotation?.id === annotation.id;
  };

  // Get additional styling for selected annotations
  const getSelectedStyle = (annotation: Annotation) => {
    if (isSelected(annotation)) {
      // Return appropriate styling based on annotation type
      switch (annotation.type) {
        case AnnotationType.HIGHLIGHT:
        case AnnotationType.RECTANGLE:
          return { strokeWidth: 3, stroke: '#3b82f6', strokeDasharray: '5,3' }; // Blue dashed outline
        case AnnotationType.UNDERLINE:
        case AnnotationType.STRIKEOUT:
        case AnnotationType.DRAWING:
          return { strokeWidth: 4, filter: 'drop-shadow(0 0 3px rgba(59, 130, 246, 0.7))' }; // Blue glow effect
        case AnnotationType.TEXT:
        case AnnotationType.COMMENT:
        case AnnotationType.PIN:
          return { filter: 'drop-shadow(0 0 3px rgba(59, 130, 246, 0.7))' }; // Blue glow effect
        default:
          return {};
      }
    }
    return {};
  };

  return (
    <div
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
    >
      <svg
        width="100%"
        height="100%"
        className="absolute top-0 left-0 pointer-events-none"
      >
        {pageAnnotations.map((annotation) => {
          const { id, type, rect, color, points } = annotation;
          
          // Don't scale the rect coordinates here since the container is already scaled
          const scaledRect = {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
          };
          
          // Get selected styling if applicable
          const selectedStyle = getSelectedStyle(annotation);

          switch (type) {
            case AnnotationType.HIGHLIGHT:
              return (
                <rect
                  key={id}
                  x={scaledRect.x}
                  y={scaledRect.y}
                  width={scaledRect.width}
                  height={scaledRect.height}
                  fill={color}
                  onClick={(e) => onAnnotationClick?.(annotation, e)}
                  className="pointer-events-auto cursor-pointer"
                  {...selectedStyle}
                />
              );
            case AnnotationType.UNDERLINE:
              return (
                <line
                  key={id}
                  x1={scaledRect.x}
                  y1={scaledRect.y + scaledRect.height}
                  x2={scaledRect.x + scaledRect.width}
                  y2={scaledRect.y + scaledRect.height}
                  stroke={color}
                  strokeWidth={2}
                  onClick={(e) => onAnnotationClick?.(annotation, e)}
                  className="pointer-events-auto cursor-pointer"
                  {...selectedStyle}
                />
              );
            case AnnotationType.STRIKEOUT:
              return (
                <line
                  key={id}
                  x1={scaledRect.x}
                  y1={scaledRect.y + scaledRect.height / 2}
                  x2={scaledRect.x + scaledRect.width}
                  y2={scaledRect.y + scaledRect.height / 2}
                  stroke={color}
                  strokeWidth={2}
                  onClick={(e) => onAnnotationClick?.(annotation, e)}
                  className="pointer-events-auto cursor-pointer"
                  {...selectedStyle}
                />
              );
            case AnnotationType.RECTANGLE:
              return (
                <rect
                  key={id}
                  x={scaledRect.x}
                  y={scaledRect.y}
                  width={scaledRect.width}
                  height={scaledRect.height}
                  stroke={color}
                  strokeWidth={2}
                  fill="none"
                  onClick={(e) => onAnnotationClick?.(annotation, e)}
                  className="pointer-events-auto cursor-pointer"
                  {...selectedStyle}
                />
              );
            case AnnotationType.DRAWING:
              if (!points || points.length < 2) return null;
              // Don't scale points as the container is already scaled
              const pathData = pointsToSvgPath(points);
              return (
                <path
                  key={id}
                  d={pathData}
                  stroke={color}
                  strokeWidth={2}
                  fill="none"
                  onClick={(e) => onAnnotationClick?.(annotation, e)}
                  className="pointer-events-auto cursor-pointer"
                  {...selectedStyle}
                />
              );
            case AnnotationType.TEXT:
              return (
                <foreignObject
                  key={id}
                  x={scaledRect.x}
                  y={scaledRect.y}
                  width={scaledRect.width || 150}
                  height={scaledRect.height || 50}
                  onClick={(e) => onAnnotationClick?.(annotation, e)}
                  className="pointer-events-auto cursor-pointer"
                  style={selectedStyle}
                >
                  <div
                    className="p-1.5 font-sans text-xs"
                    style={{
                      color: color || '#000',
                      ...(isSelected(annotation) ? { backgroundColor: 'rgba(59, 130, 246, 0.1)' } : {})
                    }}
                  >
                    {annotation.content || ''}
                  </div>
                </foreignObject>
              );
            case AnnotationType.COMMENT:
              return (
                <g
                  key={id}
                  onClick={(e) => onAnnotationClick?.(annotation, e)}
                  className="pointer-events-auto cursor-pointer"
                  style={selectedStyle}
                >
                  <circle
                    cx={scaledRect.x}
                    cy={scaledRect.y}
                    r={10}
                    fill={color || '#FFC107'}
                  />
                  <foreignObject
                    x={scaledRect.x - 7}
                    y={scaledRect.y - 7}
                    width={14}
                    height={14}
                    style={{ overflow: 'visible' }}
                  >
                    <div className="flex items-center justify-center w-full h-full text-white">
                      <FaExclamationCircle size={10} />
                    </div>
                  </foreignObject>
                </g>
              );
            case AnnotationType.PIN:
              return (
                <g
                  key={id}
                  onClick={(e) => onAnnotationClick?.(annotation, e)}
                  className="pointer-events-auto cursor-pointer"
                  style={selectedStyle}
                >
                  {/* Pin base */}
                  <circle
                    cx={scaledRect.x}
                    cy={scaledRect.y}
                    r={12}
                    fill="#fff"
                    stroke="#333"
                    strokeWidth={1}
                  />
                  {/* Pin color indicator */}
                  <circle
                    cx={scaledRect.x}
                    cy={scaledRect.y}
                    r={8}
                    fill={getTagColor(annotation)}
                  />
                  
                  {/* Use icon instead of text */}
                  <foreignObject
                    x={scaledRect.x - 6}
                    y={scaledRect.y - 6}
                    width={12}
                    height={12}
                    style={{ overflow: 'visible' }}
                  >
                    <div className="flex items-center justify-center w-full h-full text-white">
                      <IoInformationCircle size={10} />
                    </div>
                  </foreignObject>
                  
                  {/* Number badge if multiple tags */}
                  {annotation.tags && annotation.tags.length > 1 && (
                    <g>
                      <circle
                        cx={scaledRect.x + 10}
                        cy={scaledRect.y - 10}
                        r={7}
                        fill="#ef4444"
                        stroke="#fff"
                        strokeWidth={1}
                      />
                      <text
                        x={scaledRect.x + 10}
                        y={scaledRect.y - 7}
                        textAnchor="middle"
                        fill="#FFF"
                        fontSize="9"
                        fontWeight="bold"
                      >
                        {annotation.tags.length}
                      </text>
                    </g>
                  )}
                </g>
              );
            default:
              return null;
          }
        })}

        {isDrawing && activeDrawingPoints.length >= 2 && (
          <path
            d={pointsToSvgPath(activeDrawingPoints)}
            stroke={drawingColor}
            strokeWidth={2}
            fill="none"
            className="pointer-events-none"
          />
        )}
      </svg>
    </div>
  );
}; 