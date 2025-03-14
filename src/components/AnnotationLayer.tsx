import React from 'react';
import { Annotation, AnnotationType, Point } from '../types';
import { pointsToSvgPath } from '../utils';

interface AnnotationLayerProps {
  annotations: Annotation[];
  pageIndex: number;
  scale: number;
  onAnnotationClick?: (annotation: Annotation) => void;
  activeDrawingPoints?: Point[];
  isDrawing?: boolean;
  drawingColor?: string;
}

export const AnnotationLayer: React.FC<AnnotationLayerProps> = ({
  annotations,
  pageIndex,
  scale,
  onAnnotationClick,
  activeDrawingPoints = [],
  isDrawing = false,
  drawingColor = 'rgba(255, 0, 0, 0.7)', // Default red color
}) => {
  const pageAnnotations = annotations.filter(
    (annotation) => annotation.pageIndex === pageIndex
  );

  // Function to get a representative color for tags
  const getTagColor = (annotation: Annotation): string => {
    if (annotation.color) return annotation.color;
    return '#f97316'; // Orange default for pins
  };

  return (
    <div
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
    >
      <svg
        width="100%"
        height="100%"
        className="absolute top-0 left-0 pointer-events-none"
      >
        {pageAnnotations.map((annotation) => {
          const { id, type, rect, color, points } = annotation;
          const scaledRect = {
            x: rect.x * scale,
            y: rect.y * scale,
            width: rect.width * scale,
            height: rect.height * scale,
          };

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
                  onClick={() => onAnnotationClick?.(annotation)}
                  className="pointer-events-auto cursor-pointer"
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
                  onClick={() => onAnnotationClick?.(annotation)}
                  className="pointer-events-auto cursor-pointer"
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
                  onClick={() => onAnnotationClick?.(annotation)}
                  className="pointer-events-auto cursor-pointer"
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
                  onClick={() => onAnnotationClick?.(annotation)}
                  className="pointer-events-auto cursor-pointer"
                />
              );
            case AnnotationType.DRAWING:
              if (!points || points.length < 2) return null;
              const scaledPoints = points.map((point) => ({
                x: point.x * scale,
                y: point.y * scale,
              }));
              const pathData = pointsToSvgPath(scaledPoints);
              return (
                <path
                  key={id}
                  d={pathData}
                  stroke={color}
                  strokeWidth={2}
                  fill="none"
                  onClick={() => onAnnotationClick?.(annotation)}
                  className="pointer-events-auto cursor-pointer"
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
                  onClick={() => onAnnotationClick?.(annotation)}
                  className="pointer-events-auto cursor-pointer"
                >
                  <div
                    className="p-1.5 font-sans text-xs"
                    style={{
                      color: color || '#000',
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
                  onClick={() => onAnnotationClick?.(annotation)}
                  className="pointer-events-auto cursor-pointer"
                >
                  <circle
                    cx={scaledRect.x}
                    cy={scaledRect.y}
                    r={10}
                    fill={color || '#FFC107'}
                  />
                  <text
                    x={scaledRect.x}
                    y={scaledRect.y + 5}
                    textAnchor="middle"
                    fill="#FFF"
                    className="text-sm font-bold"
                  >
                    !
                  </text>
                </g>
              );
            case AnnotationType.PIN:
              return (
                <g
                  key={id}
                  onClick={() => onAnnotationClick?.(annotation)}
                  className="pointer-events-auto cursor-pointer"
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
                  {/* Pin icon */}
                  <text
                    x={scaledRect.x}
                    y={scaledRect.y + 4}
                    textAnchor="middle"
                    fill="#FFF"
                    className="text-xs font-bold"
                  >
                    {annotation.tags && annotation.tags.length > 0 ? annotation.tags.length : 'i'}
                  </text>
                  
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
            d={pointsToSvgPath(activeDrawingPoints.map(point => ({
              x: point.x * scale,
              y: point.y * scale,
            })))}
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