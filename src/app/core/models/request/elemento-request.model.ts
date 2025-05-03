export interface MoverElementoPapeleraRequest {
  elementoId: number;
  elemento: 'CARPETA' | 'ARCHIVO';
}

export interface MarcarElementoFavoritoRequest {
  elementoId: number;
  elemento: 'CARPETA' | 'ARCHIVO';
}

export interface RenombrarElementoRequest {
  elementoId: number;
  elemento: 'CARPETA' | 'ARCHIVO';
  nuevoNombre: string;
}
