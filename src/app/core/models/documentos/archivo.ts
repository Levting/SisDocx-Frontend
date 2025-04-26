import { Elemento } from './elemento';

export interface Archivo extends Elemento {
  extension: string; // Extensión del archivo (ejemplo: .txt, .pdf, etc.)
  tamano: number; // Tamaño del archivo en bytes
}
