import { Elemento } from '../documentos/elemento.model';

export interface Revision extends Elemento {
  id: number;
  remitenteId: number;
  remitente: string;
  provinciaId: number;
  provincia: string;
  revisorId: number;
  revisor: string;
  fechaEnvio: Date;
  fechaRevision: Date;
  estadoRevision: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  observaciones: string;
}
