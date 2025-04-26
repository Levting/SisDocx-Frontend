import { NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  TemplateRef,
} from '@angular/core';
import { SvgIconComponent } from 'angular-svg-icon';
import { ElementoTabla } from '../../../core/models/documentos/elementoTabla';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [NgFor, NgClass, NgIf, SvgIconComponent, NgTemplateOutlet],
  templateUrl: './table.component.html',
})
export class TableComponent {
  @Input() cabeceras: string[] = []; // Cabeceras de la tabla
  @Input() elementosTabla: ElementoTabla[] = []; // Datos de la tabla
  @Input() columnas: string[] | null = ['nombre']; // Columnas a mostrar (mostrar nombre por defecto)

  @Input() mostrarDropdown: boolean = false; // Indica si se muestra un dropdown (acciones)
  @Input() dropdownTemplate: TemplateRef<any> | null = null; // Template del dropdown
  @Input() habilitarNavegacion: boolean = false; // Indica si se muestra la navegación de carpetas

  @Output() cambioSeleccion = new EventEmitter<ElementoTabla[]>();
  @Output() dobleClickElemento = new EventEmitter<ElementoTabla>();

  estaSeleccionado(elementoTabla: ElementoTabla): boolean {
    return !!elementoTabla.seleccionado;
  }

  toggleSeleccion(elementoTabla: ElementoTabla): void {
    elementoTabla.seleccionado = !elementoTabla.seleccionado;

    const seleccionados = this.elementosTabla.filter((e) => e.seleccionado);
    this.cambioSeleccion.emit(seleccionados);
  }

  abrirCarpeta(elementoTabla: ElementoTabla): void {
    this.dobleClickElemento.emit(elementoTabla);
  }

  getAllColumnKeys(elementoTabla: ElementoTabla): string[] {
    return Object.keys(elementoTabla.columnas);
  }

  /**
   * Filtrar columnas excluyendo "nombre"
   */
  getColumnasFiltradas(): string[] {
    return this.columnas?.filter((columna) => columna !== 'nombre') || [];
  }
}
