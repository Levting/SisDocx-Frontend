export interface RevisionDesicion {
  revisionId: number;
  decision: 'APROBADO' | 'RECHAZADO';
  observaciones: string;
}
