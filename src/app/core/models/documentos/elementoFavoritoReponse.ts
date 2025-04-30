import { Elemento } from "./elemento";

export interface ElementoFavorito extends Elemento {
  fechaFavorito: string; // Fecha en formato ISO
}
