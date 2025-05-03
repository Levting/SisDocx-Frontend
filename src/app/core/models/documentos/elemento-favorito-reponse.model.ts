import { Elemento } from './elemento.model';

export interface ElementoFavorito extends Elemento {
  fechaFavorito: string; // Fecha en formato ISO
}
