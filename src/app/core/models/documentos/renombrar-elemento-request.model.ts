export interface RenombrarElementoRequest {
  elementoId: number;
  elemento: 'CARPETA' | 'ARCHIVO';
  nuevoNombre: string;
}
