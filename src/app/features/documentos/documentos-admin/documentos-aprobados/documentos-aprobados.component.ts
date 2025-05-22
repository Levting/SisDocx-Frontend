import { Component, inject } from '@angular/core';
import { RevisionService } from '../../../../core/services/revision.service';
import { ElementoRevision } from '../../../../core/models/revision/elemento-revision.model';
import { CollapseCardComponent } from '../../../../shared/components/collapse-card/collapse-card.component';

@Component({
  selector: 'app-documentos-aprobados',
  standalone: true,
  imports: [CollapseCardComponent],
  templateUrl: './documentos-aprobados.component.html',
})
export class DocumentosAprobadosComponent {
  public cabeceras: string[] = [
    'Nombre',
    'Creado Por',
    'Creado El',
    'Equipo Distribucion',
    'Tamano',
  ];
  public columnas: string[] = [
    'nombre',
    'creadoPor',
    'creadoEl',
    'equipoDistribucion',
    'tamano',
  ];
  public elementosTabla: ElementoRevision[] = [];

  // Inyección de servicios

  private revisionService: RevisionService = inject(RevisionService);

  ngOnInit(): void {
    this.cargarAprobados();
  }

  cargarAprobados(): void {
    this.revisionService.obtenerRevisiones().subscribe((elementos) => {
      this.elementosTabla = elementos;
    });
  }
}
