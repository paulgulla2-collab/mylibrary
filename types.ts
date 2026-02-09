
export interface PDFDocument {
  id: string;
  name: string;
  size: number;
  lastModified: number;
  data: Blob;
  thumbnail?: string; // Data URL
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
}

export interface AppState {
  pdfs: PDFDocument[];
  selectedId: string | null;
  isDragging: boolean;
  isSaving: boolean;
  showWelcome: boolean;
}
