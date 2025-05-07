export interface DescargarElementoRequest {
  elementoId: number;
  elemento: 'CARPETA' | 'ARCHIVO';
}