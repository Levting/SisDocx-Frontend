import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { Elemento } from '../../../../core/models/documentos/elemento.model';
import { ElementoService } from '../../../../core/services/elemento.service';
import { ElementoFiltrado } from '../../../../core/models/documentos/elemento-filtrado.model';
import { CommonModule } from '@angular/common';
import { Carpeta } from '../../../../core/models/documentos/carpeta.model';
import { Archivo } from '../../../../core/models/documentos/archivo.model';
import { ApiError } from '../../../../core/models/errors/api-error.model';
import { FileSizePipe } from '../../../../core/pipes/file-size.pipe';
import {
  finalize,
  tap,
  take,
  debounceTime,
  distinctUntilChanged,
} from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { ProvinciaService } from '../../../../core/services/provincia.service';
import { Provincia } from '../../../../core/models/usuario/provincia.model';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-documentos-aprobados',
  standalone: true,
  imports: [CommonModule, FileSizePipe, FormsModule],
  templateUrl: './documentos-aprobados.component.html',
})
export class DocumentosAprobadosComponent {
  public elementos: Elemento[] = [];
  public isLoading: boolean = false;
  public isError: boolean = false;
  public error: string | null = null;

  // Filtros
  public filtros: ElementoFiltrado = {
    nombre: null,
    elemento: null,
    provinciaId: null,
    equipoDistribucion: null,
  };

  // Opciones de selects
  public provincias: Provincia[] = [];
  public equiposDistribucion: string[] = [
    'BARRA',
    'TRANSFORMADOR',
    'UBV',
    'UMV',
    'UAV',
    'NINGUNO',
  ];

  private nombreSubject = new Subject<string>();

  // Inyección de servicios
  private elementoService: ElementoService = inject(ElementoService);
  private provinciaService: ProvinciaService = inject(ProvinciaService);
  private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.cargarAprobados();
    this.cargarProvincias();
    this.nombreSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((nombre) => {
        this.filtros.nombre = nombre;
        this.cargarAprobados();
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

  onNombreChange(nombre: string) {
    this.nombreSubject.next(nombre);
  }

  onSelectChange() {
    this.cargarAprobados();
  }

  cargarAprobados(): void {
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
    const request: ElementoFiltrado = {
      nombre: this.filtros.nombre || null,
      elemento: this.filtros.elemento || null,
      provinciaId: provinciaIdValue,
      equipoDistribucion: this.filtros.equipoDistribucion || null,
    };

    this.elementoService
      .obtenerElementosFiltrados(request)
      .pipe(
        take(1),
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (elementos) => {
          this.elementos = elementos.map((elemento) => {
            if (elemento.elemento === 'CARPETA') {
              const carpeta: Carpeta = {
                ...elemento,
                cantidadElementos: (elemento as Carpeta).cantidadElementos,
              };
              return carpeta;
            } else if (elemento.elemento === 'ARCHIVO') {
              const archivo: Archivo = {
                ...elemento,
                tipoArchivoFusion: (elemento as Archivo).tipoArchivoFusion,
                extension: (elemento as Archivo).extension,
                tamano: (elemento as Archivo).tamano,
              };
              return archivo;
            } else {
              return elemento;
            }
          });
          this.cdr.detectChanges();
        },
        error: (error: ApiError) => {
          this.isError = true;
          this.error = error.message;
          this.cdr.detectChanges();
        },
      });
  }

  // Helper methods for template
  getCarpetaDetalles(elemento: Elemento): string {
    if (elemento.elemento === 'CARPETA') {
      return `${(elemento as Carpeta).cantidadElementos} elementos`;
    }
    return '';
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
}
