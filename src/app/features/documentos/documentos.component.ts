import { Component } from '@angular/core';
import { DocumentosTableComponent } from './components/documentos-table/documentos-table.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-documentos',
  standalone: true,
  imports: [DocumentosTableComponent, ConfirmModalComponent],
  templateUrl: './documentos.component.html',
})
export class DocumentosComponent {
  public isSubirArchivoModalOpen: boolean = false;
  public isSubirCarpetaModalOpen: boolean = false;
  public carpetaPadreId: number = 0;

  openSubirArchivoModal(carpetaPadreId: number): void {
    this.carpetaPadreId = carpetaPadreId;
    this.isSubirArchivoModalOpen = true;
  }

  openSubirCarpetaModal(carpetaPadreId: number): void {
    this.carpetaPadreId = carpetaPadreId;
    this.isSubirCarpetaModalOpen = true;
  }

  onArchivosSubidos(): void {
    this.isSubirArchivoModalOpen = false;
  }

  onCarpetasSubidas(): void {
    this.isSubirCarpetaModalOpen = false;
  }
}
