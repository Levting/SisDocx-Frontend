import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Revision } from '../../../core/models/revision/elemento-revision.model';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from 'angular-svg-icon';
import { ElementoTabla } from '../../models/table/elemento-tabla.model';
import { Carpeta } from '../../../core/models/documentos/carpeta.model';
import { Archivo } from '../../../core/models/documentos/archivo.model';
import { ElementoService } from '../../../core/services/elemento.service';
import { Elemento } from '../../../core/models/documentos/elemento.model';

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

  constructor(private elementoService: ElementoService) {}

  ngOnInit(): void {
    /* console.log('ElementosTablaDesplegable', this.elementosRevision); */
  }

  // Variables
  public isExpanded = false;
  public filaExpandida: number | null = null;
  public carpetaRaiz: ElementoArbol | null = null;
  public archivoRaiz: ElementoTabla | null = null;

  // Variables para el modal de previsualización
  public isOpenPreviewModal: boolean = false;
  public elementoAPrevisualizar: ElementoTabla | null = null;

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
            next: (hijos) => {
              console.log('Contenido de la subcarpeta', hijos);
              elemento.hijos = hijos.map((hijo) => ({
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
              }));
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
    console.log('Previsualización de archivo:', elemento);
    this.verArchivo.emit(elemento);
  }

  handleAprobarRevision(revisionId: number): void {
    this.aprobarRevision.emit(revisionId);
  }

  handleRechazarRevision(revisionId: number): void {
    this.rechazarRevision.emit(revisionId);
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
}
