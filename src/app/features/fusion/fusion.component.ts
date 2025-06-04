import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FiltrosFusion } from '../../core/models/documentos/elemento-filtrado.model';
import { Provincia } from '../../core/models/usuario/provincia.model';
import {
  finalize,
  take,
  tap,
  debounceTime,
  distinctUntilChanged,
} from 'rxjs/operators';
import { ProvinciaService } from '../../core/services/provincia.service';
import { ElementoService } from '../../core/services/elemento.service';
import { Elemento } from '../../core/models/documentos/elemento.model';
import { Archivo } from '../../core/models/documentos/archivo.model';
import { ElementoTabla } from '../../shared/models/table/elemento-tabla.model';
import { SvgIconComponent } from 'angular-svg-icon';
import { ConfirmModalService } from '../../shared/services/confirm-modal.service';
import { ApiError } from '../../core/models/errors/api-error.model';
import { ToastService } from '../../core/services/toast.service';
import { FormsModule } from '@angular/forms';
import { FileSizePipe } from '../../core/pipes/file-size.pipe';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { Subject } from 'rxjs';
import { FusionarArchivoRequest } from '../../core/models/documentos/fusionar-archivo-request.model';
import { FusionService } from '../../core/services/fusion.service';

@Component({
  selector: 'app-fusion',
  standalone: true,
  imports: [
    CommonModule,
    SvgIconComponent,
    FileSizePipe,
    FormsModule,
    ConfirmModalComponent,
  ],
  templateUrl: './fusion.component.html',
})
export class FusionComponent implements OnInit {
  public elementos: Archivo[] = [];
  public elementosTabla: ElementoTabla[] = [];
  public isLoading: boolean = false;
  public isError: boolean = false;
  public error: string | null = null;

  // Propiedades para la tabla
  public cabeceras: string[] = [
    'Nombre',
    'Tipo',
    'Creado Por',
    'Fecha',
    'Detalles',
  ];

  public columnas: string[] = [
    'nombre',
    'elemento',
    'creadoPor',
    'creadoEl',
    'detalles',
  ];

  public todosSeleccionados: boolean = false;
  public ordenamiento: { columna: string; ascendente: boolean } | null = null;

  public filtros: FiltrosFusion = {
    nombre: null,
    provinciaId: null,
    equipoDistribucion: null,
    anio: null,
    mes: null,
    tipoArchivoFusion: null,
  };

  public provincias: Provincia[] = [];
  public equiposDistribucion: string[] = [
    'BARRA',
    'TRANSFORMADOR',
    'UBV',
    'UMV',
    'UAV',
  ];
  public tiposArchivoFusion: string[] = ['CAL', 'ANALIZADOR'];

  public meses: string[] = [
    '01 Enero',
    '02 Febrero',
    '03 Marzo',
    '04 Abril',
    '05 Mayo',
    '06 Junio',
    '07 Julio',
    '08 Agosto',
    '09 Septiembre',
    '10 Octubre',
    '11 Noviembre',
    '12 Diciembre',
  ];

  public anios: string[] = [
    '2024',
    '2025',
    '2026',
    '2027',
    '2028',
    '2029',
    '2030',
  ];

  // Propiedades para la selección de elementos
  public elementosSeleccionados: ElementoTabla[] = [];

  // Propiedades para el modal de renombrar
  private nombreSubject = new Subject<string>();

  // Propiedades para el estado visual
  public elementoEnfocado: ElementoTabla | null = null;

  // inyección de servicios
  private elementoService: ElementoService = inject(ElementoService);
  private provinciaService: ProvinciaService = inject(ProvinciaService);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private confirmModalService: ConfirmModalService =
    inject(ConfirmModalService);
  private toastService: ToastService = inject(ToastService);
  private fusionService: FusionService = inject(FusionService);

  ngOnInit(): void {
    this.cargarProvincias();
    this.cargarArchivosParaFusionar();
    this.nombreSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((nombre: string) => {
        this.filtros.nombre = nombre;
        this.cargarArchivosParaFusionar();
      });
  }

  cargarProvincias() {
    this.provinciaService
      .obtenerProvincias()
      .pipe(take(1))
      .subscribe({
        next: (provincias) => {
          this.provincias = provincias;
          this.cdr.detectChanges();
        },
        error: (err: ApiError) => {
          console.error('Error cargando provincias', err.message);
        },
      });
  }

  cargarArchivosParaFusionar() {
    this.isLoading = true;
    this.isError = false;
    this.error = null;
    this.cdr.detectChanges();

    let provinciaIdValue = null;
    if (
      typeof this.filtros.provinciaId === 'string' &&
      this.filtros.provinciaId !== ''
    ) {
      provinciaIdValue = Number(this.filtros.provinciaId);
    } else if (typeof this.filtros.provinciaId === 'number') {
      provinciaIdValue = this.filtros.provinciaId;
    }
    const request: FiltrosFusion = {
      nombre: this.filtros.nombre || null,
      provinciaId: provinciaIdValue,
      equipoDistribucion: this.filtros.equipoDistribucion || null,
      anio: this.filtros.anio || null,
      mes: this.filtros.mes || null,
      tipoArchivoFusion: this.filtros.tipoArchivoFusion || null,
    };

    this.elementoService
      .obtenerArchivosParaFusionar(request)
      .pipe(
        take(1),
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (elementos) => {
          // Asignar los elementos como Archivo[]
          this.elementos = elementos as Archivo[];

          // Transformar elementos a elementosTabla
          this.elementosTabla = (elementos as Archivo[]).map((elemento) => ({
            seleccionado: false,
            columnas: {
              elementoId: elemento.elementoId,
              nombre: elemento.nombre,
              elemento: elemento.elemento,
              creadoPor: elemento.creadoPor,
              creadoEl: elemento.creadoEl,
              provincia: elemento.provincia,
              carpetaPadre: elemento.carpetaPadre,
              anio: elemento.anio,
              mes: elemento.mes,
              tipoArchivoFusion: elemento.tipoArchivoFusion,
              extension: elemento.extension,
              tamano: elemento.tamano,
            },
          }));
        },
        error: (error) => {
          this.toastService.showError(error.message);
        },
      });
  }

  onSelectChange() {
    this.cargarArchivosParaFusionar();
  }

  onNombreChange(nombre: string) {
    this.nombreSubject.next(nombre);
  }

  // Método para manejar el evento de selección de elementos
  onSeleccionCambiada(seleccionados: ElementoTabla[]): void {
    this.elementosSeleccionados = seleccionados;
  }

  limpiarSeleccion(): void {
    this.elementosSeleccionados = [];
    this.elementosTabla.forEach((elemento) => {
      elemento.seleccionado = false; // Limpiar la selección de cada elemento
    });
  }

  fusionarSeleccionados(): void {
    if (this.elementosSeleccionados.length === 0) return;

    // Validar que haya más de un elemento seleccionado
    if (this.elementosSeleccionados.length === 1) {
      this.toastService.showWarning(
        'Para fusionar archivos, debes seleccionar al menos dos elementos.',
        'Advertencia'
      );
      return;
    }

    // Validar que todos los elementos sean del mismo tipo
    const primerTipo =
      this.elementosSeleccionados[0].columnas['tipoArchivoFusion'];
    const todosMismoTipo = this.elementosSeleccionados.every(
      (elemento) => elemento.columnas['tipoArchivoFusion'] === primerTipo
    );

    if (!todosMismoTipo) {
      this.toastService.showError(
        'Todos los archivos seleccionados deben ser del mismo tipo (CAL o ANALIZADOR).',
        'Error de validación'
      );
      return;
    }

    const config = {
      title: 'Fusionar',
      message: `¿Estás seguro de que deseas fusionar ${this.elementosSeleccionados.length} elementos de tipo ${primerTipo}?`,
      confirmText: 'Fusionar',
      cancelText: 'Cancelar',
    };

    this.confirmModalService.open(config).subscribe((result) => {
      if (result.confirmed) {
        const archivoIds = this.elementosSeleccionados.map(
          (e) => e.columnas['elementoId']
        );

        const request: FusionarArchivoRequest = {
          archivoId: archivoIds,
          tipoArchivoFusion: primerTipo, // ya se validó que todos son del mismo tipo
        };

        this.fusionService.fusionarArchivos(request).subscribe({
          next: (response) => {
            const blob = response.body as Blob;
            const contentDisposition = response.headers.get(
              'Content-Disposition'
            );
            let filename = 'Fusion.xlsx';

            if (contentDisposition) {
              const matches = contentDisposition.match(/filename="?([^"]+)"?/);
              if (matches?.[1]) {
                filename = matches[1];
              }
            }

            this.elementoService.descargarElementos(
              this.elementosSeleccionados.map((e) => ({
                elementoId: e.columnas['elementoId'],
                elemento: 'ARCHIVO',
              }))
            );

            this.toastService.showSuccess('Archivos fusionados correctamente');
            this.limpiarSeleccion();
            this.cargarArchivosParaFusionar();
          },
          error: (error: ApiError) => {
            this.toastService.showError(error.message);
          },
        });
      }
    });
  }

  getArchivoDetalles(elemento: Elemento): number {
    if (elemento.elemento === 'ARCHIVO') {
      return (elemento as Archivo).tamano;
    }
    return 0;
  }

  getArchivoExtension(elemento: Elemento): string {
    if (elemento.elemento === 'ARCHIVO') {
      return (elemento as Archivo).extension;
    }
    return '';
  }

  // Métodos para la tabla
  toggleSeleccionTodos(): void {
    this.todosSeleccionados = !this.todosSeleccionados;
    this.elementosTabla.forEach((elemento) => {
      elemento.seleccionado = this.todosSeleccionados;
    });
    this.actualizarElementosSeleccionados();
  }

  toggleSeleccion(elemento: ElementoTabla, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    elemento.seleccionado = !elemento.seleccionado;
    this.todosSeleccionados = this.elementosTabla.every((e) => e.seleccionado);
    this.actualizarElementosSeleccionados();
  }

  actualizarElementosSeleccionados(): void {
    this.elementosSeleccionados = this.elementosTabla.filter(
      (e) => e.seleccionado
    );
  }

  ordenarPorColumna(columna: string): void {
    if (this.ordenamiento?.columna === columna) {
      this.ordenamiento.ascendente = !this.ordenamiento.ascendente;
    } else {
      this.ordenamiento = { columna, ascendente: true };
    }

    this.elementosTabla.sort((a, b) => {
      const valorA = a.columnas[columna];
      const valorB = b.columnas[columna];

      if (valorA === valorB) return 0;
      if (valorA === null || valorA === undefined) return 1;
      if (valorB === null || valorB === undefined) return -1;

      const resultado = valorA < valorB ? -1 : 1;
      return this.ordenamiento?.ascendente ? resultado : -resultado;
    });
  }

  obtenerIconoOrdenamiento(columna: string): string {
    if (this.ordenamiento?.columna !== columna) return '';
    return this.ordenamiento.ascendente ? 'bi-sort-up' : 'bi-sort-down';
  }

  // Métodos para el estado visual
  estaEnfocado(elemento: ElementoTabla): boolean {
    return (
      this.elementoEnfocado === elemento && !this.estaSeleccionado(elemento)
    );
  }

  enfocarFila(elemento: ElementoTabla): void {
    this.elementoEnfocado = elemento;
    // Solo selecciona el elemento enfocado y deselecciona los demás
    this.elementosTabla.forEach((e) => {
      e.seleccionado = e === elemento;
    });
    this.actualizarElementosSeleccionados();
  }

  estaSeleccionado(elemento: ElementoTabla): boolean {
    return !!elemento.seleccionado;
  }

  getDistribucionColorClasses(valor: string): string {
    const colores: Record<string, string> = {
      NINGUNO: 'bg-green-100 text-green-800 border-green-300',
      TRANSFORMADOR: 'bg-red-100 text-red-800 border-red-300',
      BARRA: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      UBV: 'bg-blue-100 text-blue-800 border-blue-300',
      UMV: 'bg-purple-100 text-purple-800 border-purple-300',
      UAV: 'bg-orange-100 text-orange-800 border-orange-300',
    };

    return colores[valor] || 'bg-gray-100 text-gray-800 border-gray-300';
  }
}
