import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from 'angular-svg-icon';
import { ElementoTabla } from '../../models/table/elemento-tabla.model';
import { Archivo } from '../../../core/models/documentos/archivo.model';
import { ElementoService } from '../../../core/services/elemento.service';
import {
  Elemento,
  PaginatedResponse,
} from '../../../core/models/documentos/elemento.model';

interface ElementoArbol extends ElementoTabla {
  expandido?: boolean;
  cargando?: boolean;
  hijos?: ElementoArbol[];
}

@Component({
  selector: 'app-tabla-desplegable',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './tabla-desplegable.component.html',
})
export class TablaDesplegableComponent implements OnInit {
  @Input() elementosRevision: ElementoTabla[] = [];
  @Output() verArchivo = new EventEmitter<ElementoTabla>();
  @Output() aprobarRevision = new EventEmitter<number>();
  @Output() rechazarRevision = new EventEmitter<number>();
  @Output() aprobarSeleccionadosEvent = new EventEmitter<any[]>();

  constructor(private elementoService: ElementoService) {}

  ngOnInit(): void {}

  // Variables
  public isExpanded = false;
  public filaExpandida: number | null = null;
  public carpetaRaiz: ElementoArbol | null = null;
  public archivoRaiz: ElementoTabla | null = null;

  // Variables para el modal de previsualización
  public isOpenPreviewModal: boolean = false;
  public elementoAPrevisualizar: ElementoTabla | null = null;

  // Set para almacenar los elementos seleccionados (por elementoId)
  public seleccionados = new Set<any>();

  expandirFila(id: number): void {
    if (this.filaExpandida === id) {
      this.filaExpandida = null;
      this.carpetaRaiz = null;
      this.archivoRaiz = null;
    } else {
      this.filaExpandida = id;
      // Buscar el elemento raíz en elementosRevision
      const revision = this.elementosRevision.find(
        (el) => el.columnas['id'] == id
      );
      if (revision) {
        if (revision.columnas['elemento'] === 'CARPETA') {
          this.carpetaRaiz = {
            ...revision,
            expandido: false, // Cerrada por defecto
            cargando: false,
            hijos: [],
          };
          this.archivoRaiz = null;
        } else if (revision.columnas['elemento'] === 'ARCHIVO') {
          this.archivoRaiz = revision;
          this.carpetaRaiz = null;
        } else {
          this.carpetaRaiz = null;
          this.archivoRaiz = null;
        }
      } else {
        this.carpetaRaiz = null;
        this.archivoRaiz = null;
      }
    }
  }

  expandirCarpeta(elemento: ElementoArbol): void {
    if (elemento.columnas['elemento'] === 'CARPETA') {
      elemento.expandido = !elemento.expandido;

      if (
        elemento.expandido &&
        (!elemento.hijos || elemento.hijos.length === 0)
      ) {
        console.log('Expandir carpeta', elemento);
        elemento.cargando = true;
        this.elementoService
          .obtenerContenidoCarpeta(elemento.columnas['elementoId'])
          .subscribe({
            next: (response: PaginatedResponse<Elemento>) => {
              console.log('Contenido de la subcarpeta', response);
              elemento.hijos = response.content.map((hijo) => {
                const hijoObj = {
                  columnas: {
                    elementoId: hijo.elementoId,
                    nombre: hijo.nombre,
                    elemento: hijo.elemento,
                    extension:
                      hijo.elemento === 'ARCHIVO'
                        ? (hijo as Archivo).extension
                        : undefined,
                  },
                  expandido: false,
                  cargando: false,
                  hijos: [],
                };
                // Asignar referencia al padre
                (hijoObj as any)._padre = elemento;
                return hijoObj;
              });
              elemento.cargando = false;
            },
            error: (error) => {
              console.error(
                'Error al cargar el contenido de la subcarpeta:',
                error
              );
              elemento.cargando = false;
            },
          });
      }
    }
  }

  handleVerArchivo(elemento: ElementoTabla | ElementoArbol): void {
    this.verArchivo.emit(elemento);
  }

  handleAprobarRevision(revisionId: number): void {
    this.aprobarRevision.emit(revisionId);
  }

  handleRechazarRevision(revisionId: number): void {
    this.rechazarRevision.emit(revisionId);
  }

  handleAprobarSeleccionados(): void {
    this.aprobarSeleccionadosEvent.emit(Array.from(this.seleccionados));
    console.log('Aprobar seleccionados', Array.from(this.seleccionados));
    this.seleccionados.clear();
  }

  statusColor(status: string): string {
    return (
      {
        APROBADO: 'bg-green-600',
        PENDIENTE: 'bg-yellow-500',
        RECHAZADO: 'bg-red-600',
      }[status] || 'bg-gray-300'
    );
  }

  statusText(status: string): string {
    return (
      {
        APROBADO: 'text-green-600',
        PENDIENTE: 'text-yellow-600',
        RECHAZADO: 'text-red-600',
      }[status] || 'text-gray-500'
    );
  }

  isEstadoPendiente(estado: string): boolean {
    return estado === 'PENDIENTE';
  }

  mostrarObservaciones(estado: string, observaciones: string | null): boolean {
    return (
      !this.isEstadoPendiente(estado) &&
      observaciones !== null &&
      observaciones.trim() !== ''
    );
  }

  getTituloColumnaDinamica(): string {
    // Si no hay elementos, mostrar "Acciones" por defecto
    if (!this.elementosRevision || this.elementosRevision.length === 0) {
      return 'Acciones';
    }

    // Verificar si hay elementos con estado PENDIENTE
    const hayPendientes = this.elementosRevision.some((revision) =>
      this.isEstadoPendiente(revision.columnas['estadoRevision'])
    );

    // Si hay pendientes, mostrar "Acciones", sino "Observaciones"
    return hayPendientes ? 'Acciones' : 'Observaciones';
  }

  trackById(index: number, item: any): any {
    return item.columnas['id'];
  }

  isSelected(elemento: any): boolean {
    if (!elemento) return false;
    // Puede ser carpetaRaiz, archivoRaiz, hijo o sub
    return this.seleccionados.has(elemento.columnas['elementoId']);
  }

  toggleSeleccion(elemento: any, event: Event, padre?: any): void {
    if (!elemento) return;
    const checked = (event.target as HTMLInputElement).checked;
    const id = elemento.columnas['elementoId'];

    if (checked) {
      this.seleccionados.add(id);
      if (elemento.columnas['elemento'] === 'CARPETA' && elemento.hijos) {
        this.seleccionarRecursivo(elemento.hijos, true);
      }
    } else {
      this.seleccionados.delete(id);
      if (elemento.columnas['elemento'] === 'CARPETA' && elemento.hijos) {
        this.seleccionarRecursivo(elemento.hijos, false);
      }
    }

    // Actualizar selección ascendente
    if (padre) {
      this.actualizarSeleccionPadre(padre);
    } else if (elemento._padre) {
      this.actualizarSeleccionPadre(elemento._padre);
    }
  }

  seleccionarRecursivo(hijos: any[], seleccionar: boolean): void {
    for (const hijo of hijos) {
      const id = hijo.columnas['elementoId'];
      if (seleccionar) {
        this.seleccionados.add(id);
      } else {
        this.seleccionados.delete(id);
      }
      // Si el hijo es carpeta y tiene hijos, recursividad
      if (hijo.columnas['elemento'] === 'CARPETA' && hijo.hijos) {
        this.seleccionarRecursivo(hijo.hijos, seleccionar);
      }
    }
  }

  actualizarSeleccionPadre(padre: any): void {
    if (!padre || !padre.hijos) return;
    const todosSeleccionados = padre.hijos.every((hijo: any) =>
      this.seleccionados.has(hijo.columnas['elementoId'])
    );
    const padreId = padre.columnas['elementoId'];
    if (todosSeleccionados) {
      this.seleccionados.add(padreId);
    } else {
      this.seleccionados.delete(padreId);
    }
    // Si el padre tiene un padre, seguir subiendo
    if (padre._padre) {
      this.actualizarSeleccionPadre(padre._padre);
    }
  }
}
