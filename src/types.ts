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
export enum ENEMCategory {
  COMPETENCIA1 = 'competencia1', // Demonstrar domínio da norma padrão da língua escrita
  COMPETENCIA2 = 'competencia2', // Compreender a proposta de redação e aplicar conceitos das várias áreas de conhecimento
  COMPETENCIA3 = 'competencia3', // Selecionar, relacionar, organizar e interpretar informações em defesa de um ponto de vista
  COMPETENCIA4 = 'competencia4', // Demonstrar conhecimento dos mecanismos linguísticos necessários para a construção da argumentação
  COMPETENCIA5 = 'competencia5', // Elaborar proposta de intervenção para o problema abordado, respeitando os direitos humanos
}

// Generic category item interface for custom categories
export interface CategoryItem {
  id: string;
  displayName: string;
  color: string;
}

// Type for either ENEMCategory or custom category string ID
export type CategoryType = ENEMCategory | string;

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
  category?: CategoryType;
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

export type PDFAnnotatorProps = {
  url: string;
  annotations?: Annotation[];
  scale?: number;
  pageNumber?: number;
  onDocumentLoadSuccess?: (numPages: number) => void;
  onPageChange?: (pageNumber: number) => void;
  annotationMode?: AnnotationMode;
  onAnnotationModeChange?: (mode: AnnotationMode) => void;
  currentCategory?: CategoryType;
  onCategoryChange?: (category: CategoryType) => void;
  customCategories?: CategoryItem[]; // New prop to pass custom categories
  highlightColor?: string;
  underlineColor?: string;
  strikeoutColor?: string;
  rectangleColor?: string;
  drawingColor?: string;
  textColor?: string;
  commentColor?: string;
  pinColor?: string;
  highlightingColor?: string; // New prop for the highlighting marker color
  categoryColors?: Record<string, string>; // Updated to accept any string key
  availableTags?: TagCompetenciaInterface[];
  pdfWorkerSrc?: string;
  fitToWidth?: boolean;
  defaultThickness?: Record<AnnotationMode, number>; // Default thickness for each annotation mode
} & AnnotationEventCallbacks; 


export interface TagCompetenciaInterface {
  competencia: number
  tagsCompetencia: TagInterface[]
}
export interface TagInterface {
  _id?: string;
  tag: string;
  tipo: string;
}

export interface TagInterface {
  _id?: string;
  tag: string;
  tipo: string;
}
