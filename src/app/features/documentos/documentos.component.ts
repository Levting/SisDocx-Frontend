import { Component } from '@angular/core';
import { DocumentosTableComponent } from './components/documentos-table/documentos-table.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-documentos',
  standalone: true,
  imports: [DocumentosTableComponent, ConfirmModalComponent],
  templateUrl: './documentos.component.html',
})
export class DocumentosComponent {}
