export interface ElementoFiltrado {
  nombre: string | null ;
  elemento: 'CARPETA' | 'ARCHIVO' | null;
  provinciaId: number | null;
  equipoDistribucion: 'BARRA'| 'TRANSFORMADOR' | 'UBV' | 'UMV' | 'UMA' | 'NINGUNO' | null;
}
