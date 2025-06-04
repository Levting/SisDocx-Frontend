export interface Elemento {
  elementoId: number;
  elemento: string; // Puede ser "ARCHIVO" o "CARPETA"
  nombre: string; // Nombre del elemento
  carpetaPadreId: number; // Carpeta padre del elemento
  carpetaPadre: string;
  creadoPorId: number; // ID del usuario que creó el elemento
  creadoPor: string;
  creadoEl: string; // Fecha en formato ISO
  provinciaId: number;
  provincia: string;
  estado: string; // Estado del elemento (ACTIVO, ELIMINADO, ARCHIVADO)
  equipoDistribucion?: string;
  ruta: number[]; // Array de IDs que representa la ruta del elemento
  estadoVisibilidadAdmin?: string;
  anio: string;
  mes: string;
}
