import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  TemplateRef,
} from '@angular/core';
import { SvgIconComponent } from 'angular-svg-icon';
import { ElementoTabla } from '../../models/table/elemento-tabla.model';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './table.component.html',
})
export class TableComponent {
  @Input() cabeceras: string[] = []; // Cabeceras de la tabla
  @Input() elementosTabla: ElementoTabla[] = []; // Datos de la tabla
  @Input() columnas: string[] | null = []; // Columnas a mostrar (mostrar nombre por defecto)

  @Input() mostrarDropdown: boolean = false; // Indica si se muestra un dropdown (acciones)
  @Input() dropdownTemplate: TemplateRef<any> | null = null; // Template del dropdown
  @Input() habilitarNavegacion: boolean = false; // Indica si se muestra la navegación de carpetas
  @Input() isLoading: boolean = false; // Indica si la tabla está cargando
  @Input() isError: boolean = false; // Indica si hay un error
  @Input() error: string | null = null; // Mensaje de error

  @Output() cambioSeleccion = new EventEmitter<ElementoTabla[]>();
  @Output() dobleClickElemento = new EventEmitter<ElementoTabla>();
  @Output() toggleFavorito = new EventEmitter<ElementoTabla>();

  public searchTerm: string = '';
  public elementoEnfocado: ElementoTabla | null = null;

  // Propiedades para el ordenamiento
  public columnaOrdenada: string | null = null;
  public ordenAscendente: boolean = true;

  // public elementosSeleccionados: ElementoTabla[] = [];

  get elementosSeleccionados(): ElementoTabla[] {
    return this.elementosTabla.filter((e) => e.seleccionado);
  }

  get todosSeleccionados(): boolean {
    return (
      this.elementosTabla.length > 0 &&
      this.elementosSeleccionados.length === this.elementosTabla.length
    );
  }

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

    this.emitirCambioSeleccion();
  }

  estaSeleccionado(elementoTabla: ElementoTabla): boolean {
    return !!elementoTabla.seleccionado;
  }

  toggleSeleccion(elementoTabla: ElementoTabla): void {
    elementoTabla.seleccionado = !elementoTabla.seleccionado;
    this.emitirCambioSeleccion();
  }

  toggleSeleccionTodos(): void {
    const seleccionar = !this.todosSeleccionados;
    this.elementosTabla.forEach((e) => (e.seleccionado = seleccionar));
    this.emitirCambioSeleccion();
  }

  emitirCambioSeleccion(): void {
    this.cambioSeleccion.emit(this.elementosSeleccionados);
  }

  esFavorito(elementoTabla: ElementoTabla): boolean {
    return elementoTabla.columnas['estado'] === 'FAVORITO';
  }

  onToggleFavorito(elementoTabla: ElementoTabla, event: Event): void {
    event.stopPropagation();
    this.toggleFavorito.emit(elementoTabla);
  }

  abrirCarpeta(elementoTabla: ElementoTabla): void {
    this.dobleClickElemento.emit(elementoTabla);
  }

  getAllColumnKeys(elementoTabla: ElementoTabla): string[] {
    return Object.keys(elementoTabla.columnas);
  }

  /**
   * Obtiene las columnas a mostrar, excluyendo la columna de acciones si existe
   */
  getColumnasFiltradas(): string[] {
    return this.columnas?.filter((columna) => columna !== 'nombre') || [];
  }

  // Métodos para el ordenamiento
  ordenarPorColumna(columna: string): void {
    if (this.columnaOrdenada === columna) {
      // Si ya está ordenada por esta columna, invertir el orden
      this.ordenAscendente = !this.ordenAscendente;
    } else {
      // Si es una nueva columna, ordenar ascendente por defecto
      this.columnaOrdenada = columna;
      this.ordenAscendente = true;
    }

    this.elementosTabla.sort((a, b) => {
      const valorA = a.columnas[columna];
      const valorB = b.columnas[columna];

      // Manejar diferentes tipos de datos
      if (typeof valorA === 'string' && typeof valorB === 'string') {
        return this.ordenAscendente
          ? valorA.localeCompare(valorB)
          : valorB.localeCompare(valorA);
      }

      if (valorA instanceof Date && valorB instanceof Date) {
        return this.ordenAscendente
          ? valorA.getTime() - valorB.getTime()
          : valorB.getTime() - valorA.getTime();
      }

      // Para números y otros tipos
      if (valorA < valorB) {
        return this.ordenAscendente ? -1 : 1;
      }
      if (valorA > valorB) {
        return this.ordenAscendente ? 1 : -1;
      }
      return 0;
    });
  }

  obtenerIconoOrdenamiento(columna: string): string {
    if (this.columnaOrdenada !== columna) {
      return 'bi-arrow-down-up'; // Icono por defecto
    }
    return this.ordenAscendente ? 'bi-arrow-down' : 'bi-arrow-up';
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
