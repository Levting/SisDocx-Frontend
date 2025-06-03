import { Archivo } from './archivo.model';

export interface CampanaMedicion extends Archivo {
  campanaMedicionId: number;
  anio: string;
  // elementoId: number;
  // nombre: string;
  // creadoPor: string;
  // creadoEl: string;
  estadoProcesamiento: string;
  fechaInicioProcesamiento: Date;
  mensajeError: string;
  vigencia: string;
}
