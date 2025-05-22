import { Component, inject, OnInit } from '@angular/core';
import { DocumentosTablaEstadosComponent } from './components/documentos-tabla-estados/documentos-tabla-estados.component';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { CollapseCardComponent } from '../../../../shared/components/collapse-card/collapse-card.component';
import { RevisionService } from '../../../../core/services/revision.service';
import { ElementoRevision } from '../../../../core/models/revision/elemento-revision.model';

@Component({
  selector: 'app-documentos-por-aprobar',
  standalone: true,
  imports: [ConfirmModalComponent, CollapseCardComponent],
  templateUrl: './documentos-por-aprobar.component.html',
})
export class DocumentosPorAprobarComponent implements OnInit {

  // Variables
  public revisiones: ElementoRevision[] = [];

  // Inyección de servicion
  private revisionService = inject(RevisionService);


  ngOnInit(): void {
    this.revisionService.obtenerRevisiones().subscribe((revisiones) => {
      this.revisiones = revisiones;
      console.log('Revisiones', revisiones);
    });
  }
}
