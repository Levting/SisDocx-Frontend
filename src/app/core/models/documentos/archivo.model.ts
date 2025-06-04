import { Elemento } from './elemento.model';

export interface Archivo extends Elemento {
  tipoArchivoFusion: 'CAL' | 'ANALIZADOR' | null;
  extension: string; // Extensión del archivo (ejemplo: .txt, .pdf, etc.)
  tamano: number; // Tamaño del archivo en bytes
}
