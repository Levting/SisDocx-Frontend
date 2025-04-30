import { Component } from '@angular/core';
import { DocumentosTableComponent } from './components/documentos-table/documentos-table.component';

@Component({
  selector: 'app-documentos',
  standalone: true,
  imports: [DocumentosTableComponent],
  templateUrl: './documentos.component.html',
})
export class DocumentosComponent {}
