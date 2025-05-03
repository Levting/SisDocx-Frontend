import { Elemento } from './elemento.model';

export interface Carpeta extends Elemento {
  cantidadElementos: number; // Tamaño del archivo en bytes
}
