import React from 'react';
import { Annotation, AnnotationType } from '../types';
import { pointsToSvgPath } from '../utils';

interface AnnotationLayerProps {
  annotations: Annotation[];
  pageIndex: number;
  scale: number;
  onAnnotationClick?: (annotation: Annotation) => void;
}

export const AnnotationLayer: React.FC<AnnotationLayerProps> = ({
  annotations,
  pageIndex,
  scale,
  onAnnotationClick,
}) => {
  const pageAnnotations = annotations.filter(
    (annotation) => annotation.pageIndex === pageIndex
  );

  return (
    <div
      className="pdf-annotator-annotation-layer"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      <svg
        width="100%"
        height="100%"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none',
        }}
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
                  style={{ pointerEvents: 'all', cursor: 'pointer' }}
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
                  style={{ pointerEvents: 'all', cursor: 'pointer' }}
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
                  style={{ pointerEvents: 'all', cursor: 'pointer' }}
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
                  style={{ pointerEvents: 'all', cursor: 'pointer' }}
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
                  style={{ pointerEvents: 'all', cursor: 'pointer' }}
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
                  style={{ pointerEvents: 'all', cursor: 'pointer' }}
                >
                  <div
                    style={{
                      color: color || '#000',
                      padding: '5px',
                      fontFamily: 'Arial, sans-serif',
                      fontSize: '12px',
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
                  style={{ pointerEvents: 'all', cursor: 'pointer' }}
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
                    fontSize="14px"
                    fontWeight="bold"
                  >
                    !
                  </text>
                </g>
              );
            default:
              return null;
          }
        })}
      </svg>
    </div>
  );
}; 