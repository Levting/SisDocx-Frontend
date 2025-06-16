import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Revision } from '../../core/models/revision/elemento-revision.model';
import { RevisionService } from '../../core/services/revision.service';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from 'angular-svg-icon';
import { ElementoTabla } from '../../shared/models/table/elemento-tabla.model';
import { TransformacionService } from '../../core/services/transformacion.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-documentos-situacion',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './documentos-situacion.component.html',
})
export class DocumentosSituacionComponent implements OnInit, OnDestroy {
  public revisiones: ElementoTabla[] = [];
  private destroy$ = new Subject<void>();

  // Inyección de servicios
  private revisionService: RevisionService = inject(RevisionService);
  private transformacionService: TransformacionService = inject(
    TransformacionService
  );

  ngOnInit(): void {
    this.cargarRevisiones();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargarRevisiones(): void {
    this.revisionService
      .obtenerRevisiones()
      .pipe(takeUntil(this.destroy$))
      .subscribe((revisiones) => {
        this.revisiones = revisiones.map((revision) =>
          this.transformacionService.transformarATablaRevision(revision)
        );
      });
  }
}
