export interface Elemento {
  elementoId: number;
  elemento: string; // Puede ser "ARCHIVO" o "CARPETA"
  nombre: string; // Nombre del elemento
  creadoPorId: number; // ID del usuario que creó el elemento
  creadoPor: string;
  creadoEl: string; // Fecha en formato ISO
  ruta: number[]; // Array de IDs que representa la ruta del elemento
  estado: string; // Estado del elemento (ACTIVO, ELIMINADO, ARCHIVADO)
  provinciaId: number;
  provincia: string;
  carpetaPadreId: number; // Carpeta padre del elemento
  carpetaPadre: string;
  equipoDistribucion: 'BARRIA' | 'TRANSFORMADOR' | 'UBV' | 'UMV' | 'UAV' | 'NINGUNO';
  estadoVisibilidad: 'CREADO_ADMINISTRADOR' | 'CREADO' | 'ENVIADO' | 'ACEPTADO' | 'RECHAZADO';
  anio: string;
  mes: string;
}