export interface MoverElementoRequest {
  elementoId: number;
  elemento: 'CARPETA' | 'ARCHIVO';
  carpetaPadreId: number;
}

