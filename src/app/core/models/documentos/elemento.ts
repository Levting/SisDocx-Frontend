export interface Elemento {
  elementoId: number;
  elemento: string; // Puede ser "ARCHIVO" o "CARPETA"
  nombre: string; // Nombre del elemento
  carpetaPadreId: number; // Carpeta padre del elemento
  creadoPor: number; // ID del usuario que creó el elemento
  creadoEl: string; // Fecha en formato ISO
  estado: string; // Estado del elemento (ACTIVO, ELIMINADO, ARCHIVADO)
  ruta: number[]; // Array de IDs que representa la ruta del elemento
}
