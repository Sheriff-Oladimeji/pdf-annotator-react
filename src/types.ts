export type Point = {
  x: number;
  y: number;
};

export type AnnotationRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  pageIndex: number;
};

export enum AnnotationType {
  HIGHLIGHT = 'highlight',
  UNDERLINE = 'underline',
  STRIKEOUT = 'strikeout',
  RECTANGLE = 'rectangle',
  DRAWING = 'drawing',
  TEXT = 'text',
  COMMENT = 'comment',
}

export type Annotation = {
  id: string;
  type: AnnotationType;
  rect: AnnotationRect;
  pageIndex: number;
  content?: string;
  color?: string;
  createdAt: Date;
  updatedAt?: Date;
  author?: string;
  points?: Point[];
};

export type AnnotationEventCallbacks = {
  onAnnotationCreate?: (annotation: Annotation) => void;
  onAnnotationUpdate?: (annotation: Annotation) => void;
  onAnnotationDelete?: (annotationId: string) => void;
  onAnnotationSelect?: (annotation: Annotation | null) => void;
};

export enum AnnotationMode {
  NONE = 'none',
  HIGHLIGHT = 'highlight',
  UNDERLINE = 'underline',
  STRIKEOUT = 'strikeout',
  RECTANGLE = 'rectangle',
  DRAWING = 'drawing',
  TEXT = 'text',
  COMMENT = 'comment',
}

export type PDFAnnotatorProps = {
  url: string;
  annotations?: Annotation[];
  scale?: number;
  pageNumber?: number;
  onDocumentLoadSuccess?: (numPages: number) => void;
  onPageChange?: (pageNumber: number) => void;
  annotationMode?: AnnotationMode;
  onAnnotationModeChange?: (mode: AnnotationMode) => void;
  highlightColor?: string;
  underlineColor?: string;
  strikeoutColor?: string;
  rectangleColor?: string;
  drawingColor?: string;
  textColor?: string;
  commentColor?: string;
} & AnnotationEventCallbacks; 