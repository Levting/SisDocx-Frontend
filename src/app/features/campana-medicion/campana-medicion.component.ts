import { Component, inject, OnInit } from '@angular/core';
import { TableComponent } from '../../shared/components/table/table.component';
import { SvgIconComponent } from 'angular-svg-icon';
import { SubirCampanaMedicionModalComponent } from './components/subir-campana-medicion-modal/subir-campana-medicion-modal.component';
import { ApiError } from '../../core/models/errors/api-error.model';
import { CampanaMedicionService } from '../../core/services/campana-medicion.service';
import { CampanaMedicion } from '../../core/models/documentos/campana-medicion.model';
import { ElementoTabla } from '../../shared/models/table/elemento-tabla.model';
import { TransformacionService } from '../../core/services/transformacion.service';

@Component({
  selector: 'app-campana-medicion',
  standalone: true,
  imports: [
    TableComponent,
    SvgIconComponent,
    SubirCampanaMedicionModalComponent,
  ],
  templateUrl: './campana-medicion.component.html',
})
export class CampanaMedicionComponent implements OnInit {
  public campanas: CampanaMedicion[] = [];
  public campanasTabla: ElementoTabla[] = [];

  // Inyección de servicios
  private campanaMedicionService: CampanaMedicionService = inject(
    CampanaMedicionService
  );
  private transformacionService: TransformacionService = inject(
    TransformacionService
  );

  // Indicadores de estado
  public isLoading: boolean = false;
  public isError: boolean = false;
  public error: string | null = null;

  // Variables del modal
  public isOpenSubirCampanaMedicionModal: boolean = false;

  // Variables de la tabla
  public cabeceras: string[] = [
    'Campaña',
    'Subido por',
    'Subido el',
    'Año',
    'Estado',
  ];
  public columnas: string[] = [
    'creadoPor',
    'creadoEl',
    'anio',
    'vigencia',
  ];
  public elementosSeleccionados: ElementoTabla[] = [];

  ngOnInit(): void {
    this.isOpenSubirCampanaMedicionModal = false;
    this.cargarCampanasMedicion();
  }

  abrirModalSubirCampanaMedicion(): void {
    this.isOpenSubirCampanaMedicionModal = true;
  }

  cerrarModalSubirCampanaMedicion(): void {
    this.isOpenSubirCampanaMedicionModal = false;
  }

  onCampanaCreada(): void {
    this.isOpenSubirCampanaMedicionModal = false;
    this.cargarCampanasMedicion();
  }

  // Contenido de la tabla
  cargarCampanasMedicion(): void {
    this.campanaMedicionService.obtenerCampanasMedicion().subscribe({
      next: (elementos) => {
        console.log('Elementos: ', elementos);
        this.campanas = elementos;
        this.transformacionService
          .transformarCampanasMedicionATabla(this.campanas)
          .subscribe((filas) => {
            this.campanasTabla = filas;
            console.log('Campanas tabla: ', this.campanasTabla);
          });
      },
      error: (error: ApiError) => {
        this.error = error.message;
      },
    });
  }

  onCambioSeleccion(seleccionados: ElementoTabla[]): void {
    this.elementosSeleccionados = seleccionados;
  }

  onDobleClickElemento(elemento: ElementoTabla): void {
    console.log(elemento);
  }

  limpiarSeleccion(): void {
    this.elementosSeleccionados = [];
    this.campanasTabla.forEach((elemento) => {
      elemento.seleccionado = false;
    });
  }
}
