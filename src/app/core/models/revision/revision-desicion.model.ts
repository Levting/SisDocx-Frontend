export interface RevisionDesicion {
  revisionId: number;
  estadoRevision: 'APROBADO' | 'RECHAZADO';
  observaciones: string;
}
