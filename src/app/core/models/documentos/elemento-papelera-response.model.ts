import { Elemento } from './elemento.model';

export interface ElementoPapelera extends Elemento {
  fechaPapelera: string; // Fecha en que el elemento fue enviado a la papelera
  eliminadoPor: number; // ID del usuario que eliminó el elemento
}
