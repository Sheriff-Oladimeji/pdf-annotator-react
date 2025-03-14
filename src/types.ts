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
  PIN = 'pin',
}

export enum ENEMCategory {
  COMPETENCIA1 = 'competencia1', // Demonstrar domínio da norma padrão da língua escrita
  COMPETENCIA2 = 'competencia2', // Compreender a proposta de redação e aplicar conceitos das várias áreas de conhecimento
  COMPETENCIA3 = 'competencia3', // Selecionar, relacionar, organizar e interpretar informações em defesa de um ponto de vista
  COMPETENCIA4 = 'competencia4', // Demonstrar conhecimento dos mecanismos linguísticos necessários para a construção da argumentação
  COMPETENCIA5 = 'competencia5', // Elaborar proposta de intervenção para o problema abordado, respeitando os direitos humanos
}

export interface TagInterface {
  _id?: string;
  tag: string;
  tipo: string;
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
  category?: ENEMCategory;
  tags?: TagInterface[];
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
  currentCategory?: ENEMCategory;
  onCategoryChange?: (category: ENEMCategory) => void;
  highlightColor?: string;
  underlineColor?: string;
  strikeoutColor?: string;
  rectangleColor?: string;
  drawingColor?: string;
  textColor?: string;
  commentColor?: string;
  pinColor?: string;
  categoryColors?: Record<ENEMCategory, string>;
  availableTags?: TagInterface[];
  pdfWorkerSrc?: string;
} & AnnotationEventCallbacks; 