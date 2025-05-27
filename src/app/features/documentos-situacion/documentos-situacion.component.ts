import { Component, inject, OnInit } from '@angular/core';
import { Revision } from '../../core/models/revision/elemento-revision.model';
import { RevisionService } from '../../core/services/revision.service';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from 'angular-svg-icon';
import { ElementoTabla } from '../../shared/models/table/elemento-tabla.model';
import { TransformacionService } from '../../core/services/transformacion.service';

@Component({
  selector: 'app-documentos-situacion',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './documentos-situacion.component.html',
})
export class DocumentosSituacionComponent implements OnInit {

  public revisiones: ElementoTabla[] = [];

  // Inyección de servicios
  private revisionService: RevisionService = inject(RevisionService);
  private transformacionService: TransformacionService = inject(TransformacionService);

  ngOnInit(): void {
    this.revisionService.obtenerRevisiones().subscribe((revisiones) => {
      this.revisiones = revisiones.map((revision) =>
        this.transformacionService.transformarATablaRevision(revision)
      );
    });
  }
}
