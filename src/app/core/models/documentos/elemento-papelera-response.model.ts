import { Elemento } from './elemento.model';

export interface ElementoPapelera extends Elemento {
  fechaPapelera: string; // Fecha en que el elemento fue enviado a la papelera
  eliminadoPorId: number; // ID del usuario que eliminó el elemento
  eliminadoPor: string; // Nombre del usuario que eliminó el elemento
}
