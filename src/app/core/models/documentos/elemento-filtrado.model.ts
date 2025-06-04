export interface ElementoFiltrado {
  nombre: string | null ;
  elemento: 'CARPETA' | 'ARCHIVO' | null;
  provinciaId: number | null;
  equipoDistribucion: 'BARRA'| 'TRANSFORMADOR' | 'UBV' | 'UMV' | 'UMA' | 'NINGUNO' | null;
}

export interface FiltrosFusion {
  nombre: string | null ;
  provinciaId: number | null;
  equipoDistribucion: 'BARRA'| 'TRANSFORMADOR' | 'UBV' | 'UMV' | 'UMA' | null;
  anio: string | null;
  mes: string | null;
  tipoArchivoFusion: 'CAL' | 'ANALIZADOR' | null; // Trae cal y analizadores
}
