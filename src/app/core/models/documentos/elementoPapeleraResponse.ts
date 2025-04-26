export interface ElementoPapelera {
  elementoId: number; // ID del elemento
  elementoTipo: string; // Tipo de elemento (CARPETA, DOCUMENTO, etc.)
  nombre: string; // Nombre del elemento
  creadoPor: number; // ID del usuario que creó el elemento
  ruta: string[]; // Ruta del elemento (ej. ['1', '2'])
  eliminadoPor: number; // ID del usuario que eliminó el elemento
  fechaPapelera: string; // Fecha en que el elemento fue enviado a la papelera
}
