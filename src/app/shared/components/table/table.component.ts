import {
  NgClass,
  NgFor,
  NgIf,
  NgTemplateOutlet,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
} from '@angular/common';
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
  imports: [
    NgFor,
    NgClass,
    NgIf,
    SvgIconComponent,
    NgTemplateOutlet,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
  ],
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
}
