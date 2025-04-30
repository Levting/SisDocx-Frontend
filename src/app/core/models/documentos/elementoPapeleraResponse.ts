import { Elemento } from "./elemento";

export interface ElementoPapelera extends Elemento  {
  fechaPapelera: string; // Fecha en que el elemento fue enviado a la papelera
  eliminadoPor: number; // ID del usuario que eliminó el elemento
}