import { Elemento } from "./elemento";

export interface Carpeta extends Elemento {
  cantidadElementos: number; // Tamaño del archivo en bytes
}
