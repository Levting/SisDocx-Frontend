import { Elemento } from './elemento.model';

export interface Archivo extends Elemento {
  extension: string; // Extensión del archivo (ejemplo: .txt, .pdf, etc.)
  tamano: number; // Tamaño del archivo en bytes
  tipoFusion: 'CAL' | 'ANALIZADOR' | 'NINGUNO';
  tipoContenido: 'FUENTE' | 'PROCESADO' | 'NINGUNO';
}
