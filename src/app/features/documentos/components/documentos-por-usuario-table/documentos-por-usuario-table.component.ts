import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent } from '../../../../shared/components/table/table.component';
import { ElementoService } from '../../../../core/services/elemento.service';
import { Elemento } from '../../../../core/models/documentos/elemento.model';
import { ElementoTabla } from '../../../../shared/models/table/elemento-tabla.model';
import { TransformacionService } from '../../../../core/services/transformacion.service';
import { ApiError } from '../../../../core/models/errors/api-error.model';
import { LoggerService } from '../../../../core/services/logger.service';

@Component({
  selector: 'app-documentos-por-usuario-table',
  standalone: true,
  imports: [TableComponent],
  templateUrl: './documentos-por-usuario-table.component.html',
})
export class DocumentosPorUsuarioTableComponent implements OnInit {
  public elementosTabla: ElementoTabla[] = [];
  public elementosOriginales: Elemento[] = [];
  public cabeceras: string[] = [
    'Nombre',
    'Usuario',
    'Modificado el',
    'Tamaño',
    'Estado',
  ];
  public columnas: string[] = [
    'nombre',
    'usuario',
    'creadoEl',
    'cantidadElementos',
    'estado',
  ];

  // Inyección de servicios
  private elementoService = inject(ElementoService);
  private transformacionService = inject(TransformacionService);
  private logger = inject(LoggerService);

  // Indicadores de estado
  public isLoading: boolean = false;
  public isError: boolean = false;
  public error: string | null = null;

  ngOnInit(): void {
    this.cargarDocumentosPorUsuario();
  }

  private cargarDocumentosPorUsuario(): void {
    this.isLoading = true;
    this.isError = false;
    this.error = null;

    /* this.elementoService.obtenerDocumentosPorUsuario().subscribe({
      next: (elementos: Elemento[]) => {
        this.elementosOriginales = elementos;
        this.transformacionService
          .transformarDocumentosATabla(elementos)
          .subscribe({
            next: (filas) => {
              this.elementosTabla = filas;
              this.isLoading = false;
            },
            error: (err: ApiError) => {
              this.isLoading = false;
              this.isError = true;
              this.error = 'Error al transformar los elementos para la tabla';
              this.logger.error('Error al transformar elementos:', err.message);
            },
          });
      },
      error: (err: ApiError) => {
        this.isLoading = false;
        this.isError = true;
        this.error =
          err.message || 'Error al cargar los documentos por usuario';
        this.logger.error(
          'Error al cargar documentos por usuario:',
          err.message
        );
      },
    }); */
  }

  onSeleccionCambiada(seleccionados: ElementoTabla[]): void {
    // Implementar lógica de selección si es necesaria
    console.log('Elementos seleccionados:', seleccionados);
  }
}
