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
  HIGHLIGHTING = 'highlighting',
  TEXT = 'text',
  COMMENT = 'comment',
  PIN = 'pin',
}

// Default ENEM categories - keep for backward compatibility




export interface Annotation {
  id: string;
  type: AnnotationType;
  rect: AnnotationRect;
  pageIndex: number;
  color: string;
  content: string;
  points?: Point[];
  tags?: TagInterface[];
  createdAt: Date;
  updatedAt?: Date;
  category?: CategoryItem;
  thickness?: number; // Add thickness property to store stroke width
}

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
  HIGHLIGHTING = 'highlighting',
  TEXT = 'text',
  COMMENT = 'comment',
  PIN = 'pin',
}

export interface PDFAnnotatorProps {
  url: string;
  annotations?: Annotation[];
  scale?: number;
  pageNumber?: number;
  onDocumentLoadSuccess?: (numPages: number) => void;
  onPageChange?: (page: number) => void;
  annotationMode?: AnnotationMode;
  onAnnotationModeChange?: (mode: AnnotationMode) => void;
  currentCategory?: CategoryItem;
  onCategoryChange?: (category: CategoryItem | undefined) => void;
  onAnnotationCreate?: (annotation: Annotation) => void;
  onAnnotationUpdate?: (annotation: Annotation) => void;
  onAnnotationDelete?: (annotationId: string) => void;
  onAnnotationSelect?: (annotation: Annotation | null) => void;
  onAnnotationsChange?: (annotations: Annotation[]) => void;
  highlightColor?: string;
  underlineColor?: string;
  strikeoutColor?: string;
  rectangleColor?: string;
  drawingColor?: string;
  textColor?: string;
  commentColor?: string;
  pinColor?: string;
  customCategories?: CustomCategory[];
  pdfWorkerSrc?: string;
  fitToWidth?: boolean;
  defaultThickness?: number;
  viewOnly?: boolean;
  hideDetailsOnIdSelection?: boolean; // New prop to control annotation details visibility when selecting by ID
}


export interface CustomCategory {
  competencia: CategoryItem
  tagsCompetencia: TagInterface[]
}


export interface TagInterface {
  _id?: string;
  tag: string;
  tipo: string;
}


// Generic category item interface for custom categories
export interface CategoryItem {
  category: number;
  displayName: string;
  color: string;
}