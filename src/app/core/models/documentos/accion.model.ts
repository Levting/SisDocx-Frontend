import { Elemento } from './elemento.model';

export interface Accion {
  usuarioId: number; // ID del usuario que realizó la acción
  elementoId: number; // ID del elemento sobre el que se realizó la acción
  elemento: Elemento; // Objeto Elemento que representa el elemento afectado
  accion: string; // Acción realizada (ejemplo: "CREAR", "ELIMINAR", "RENOMBRAR", etc.)
  fecha: string; // Fecha y hora en que se realizó la acción (en formato ISO)
}
