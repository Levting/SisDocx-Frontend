import {
  Component,
  Output,
  TemplateRef,
  Input,
  EventEmitter,
  OnInit,
  inject,
  input,
} from '@angular/core';
import { ElementoTabla } from '../../models/table/elemento-tabla.model';
import { CommonModule, NgIf } from '@angular/common';
import { SvgIconComponent } from 'angular-svg-icon';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

export interface ColumnaConfig {
  key: string;
  label: string;
  type: 'text' | 'badge' | 'status' | 'status-dot' | 'actions';
  badgeColor?: string;
  badgeTextColor?: string;
  hidden?: boolean;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  sortable?: boolean;
}

@Component({
  selector: 'app-tabla-estado',
  standalone: true,
  imports: [NgIf, CommonModule, SvgIconComponent, FormsModule],
  templateUrl: './tabla-estado.component.html',
})
export class TablaEstadoComponent implements OnInit {
  @Input() columnasConfig: ColumnaConfig[] = [];
  @Input() elementosTabla: ElementoTabla[] = [];
  @Input() mostrarDropdown: boolean = false;
  @Input() dropdownTemplate: TemplateRef<any> | null = null;
  @Input() habilitarNavegacion: boolean = false;
  @Input() isLoading: boolean = false;
  @Input() isError: boolean = false;
  @Input() error: string | null = null;
  @Input() isElementoDisabled: ((elemento: ElementoTabla) => boolean) | null =
    null;

  @Output() cambioSeleccion = new EventEmitter<ElementoTabla[]>();
  @Output() dobleClickElemento = new EventEmitter<ElementoTabla>();
  @Output() aprobarEvent = new EventEmitter<ElementoTabla>();
  @Output() rechazarEvent = new EventEmitter<ElementoTabla>();
  @Output() aprobarSeleccionadosEvent = new EventEmitter<ElementoTabla[]>();
  @Output() rechazarSeleccionadosEvent = new EventEmitter<ElementoTabla[]>();
  @Output() enviarSolicitud = new EventEmitter<ElementoTabla>();

  // Inyeccion de servicios
  private authService: AuthService = inject(AuthService);

  // Estado del usuario administrador
  public isAdmin: boolean = false;

  // Elemento enfocado
  public elementoEnfocado: ElementoTabla | null = null;

  // Propiedades para el ordenamiento
  public columnaOrdenada: string | null = null;
  public ordenAscendente: boolean = true;

  ngOnInit(): void {
    // Suscribirse a los cambios del rol del usuario para mostrar los botones de administrador
    this.authService.userRole$.subscribe((role) => {
      this.isAdmin = role === 'Administrador';
    });
  }

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

  estaDeshabilitado(elemento: ElementoTabla): boolean {
    return this.isElementoDisabled ? this.isElementoDisabled(elemento) : false;
  }

  enfocarFila(elemento: ElementoTabla): void {
    if (this.estaDeshabilitado(elemento)) return;

    this.elementoEnfocado = elemento;
    this.elementosTabla.forEach((e) => {
      e.seleccionado = e === elemento;
    });
    this.emitirCambioSeleccion();
  }

  estaSeleccionado(elementoTabla: ElementoTabla): boolean {
    return !!elementoTabla.seleccionado;
  }

  toggleSeleccion(elementoTabla: ElementoTabla): void {
    if (this.estaDeshabilitado(elementoTabla)) return;

    elementoTabla.seleccionado = !elementoTabla.seleccionado;
    this.emitirCambioSeleccion();
  }

  toggleSeleccionTodos(): void {
    const seleccionar = !this.todosSeleccionados;
    this.elementosTabla.forEach((e) => {
      if (!this.estaDeshabilitado(e)) {
        e.seleccionado = seleccionar;
      }
    });
    this.emitirCambioSeleccion();
  }

  emitirCambioSeleccion(): void {
    this.cambioSeleccion.emit(this.elementosSeleccionados);
  }

  abrirCarpeta(elementoTabla: ElementoTabla): void {
    // Permitir navegación en carpetas incluso si están deshabilitadas
    if (
      this.habilitarNavegacion &&
      elementoTabla.columnas['elemento'] === 'CARPETA'
    ) {
      this.dobleClickElemento.emit(elementoTabla);
    } else if (
      this.habilitarNavegacion &&
      !this.estaDeshabilitado(elementoTabla)
    ) {
      this.dobleClickElemento.emit(elementoTabla);
    }
  }

  // Método para verificar si se debe mostrar el dropdown
  mostrarDropdownParaElemento(elemento: ElementoTabla): boolean {
    return this.mostrarDropdown && !this.estaDeshabilitado(elemento);
  }

  onAprobar(elemento: ElementoTabla): void {
    this.aprobarEvent.emit(elemento);
  }

  onRechazar(elemento: ElementoTabla): void {
    this.rechazarEvent.emit(elemento);
  }

  onAprobarSeleccionados(): void {
    if (this.elementosSeleccionados.length > 0) {
      this.aprobarSeleccionadosEvent.emit(this.elementosSeleccionados);
    }
  }

  onRechazarSeleccionados(): void {
    if (this.elementosSeleccionados.length > 0) {
      this.rechazarSeleccionadosEvent.emit(this.elementosSeleccionados);
    }
  }

  onEnviarSolicitud(elementoTabla: ElementoTabla): void {
    this.enviarSolicitud.emit(elementoTabla);
    // Actualizar el estado del elemento inmediatamente después de enviar la solicitud
    this.actualizarEstadoElemento(elementoTabla, 'PENDIENTE');
  }

  getIconForFile(extension: string): string {
    const extensionMap: { [key: string]: string } = {
      pdf: 'assets/icons/filePdf.svg',
      docx: 'assets/icons/fileDocx.svg',
      doc: 'assets/icons/fileDocx.svg',
      xls: 'assets/icons/fileExcel.svg',
      xlsx: 'assets/icons/fileExcel.svg',
      jpg: 'assets/icons/fileImage.svg',
      jpeg: 'assets/icons/fileImage.svg',
      png: 'assets/icons/fileImage.svg',
    };
    return extensionMap[extension?.toLowerCase()] || 'assets/icons/folder.svg';
  }

  getColumnasFiltradas(): ColumnaConfig[] {
    return (
      this.columnasConfig?.filter(
        (col) => !col.hidden && col.key !== 'nombre'
      ) || []
    );
  }

  getNombreColumn(): ColumnaConfig | undefined {
    return this.columnasConfig?.find((col) => col.key === 'nombre');
  }

  getColumnStyle(columna: ColumnaConfig): string {
    const styles: string[] = [];

    if (columna.width) {
      styles.push(`width: ${columna.width}`);
    }
    if (columna.minWidth) {
      styles.push(`min-width: ${columna.minWidth}`);
    }
    if (columna.maxWidth) {
      styles.push(`max-width: ${columna.maxWidth}`);
    }

    return styles.join('; ');
  }

  getBadgeClasses(columna: ColumnaConfig): string {
    if (columna.type !== 'badge') return '';

    const baseClasses = 'px-2.5 py-0.5 rounded-full text-xs font-medium';
    const colorClasses = `${columna.badgeColor || 'bg-gray-100'} ${
      columna.badgeTextColor || 'text-gray-800'
    }`;

    return `${baseClasses} ${colorClasses}`;
  }

  getStatusClasses(elemento: ElementoTabla, columna: ColumnaConfig): string {
    if (columna.type !== 'status' && columna.type !== 'status-dot') return '';

    const valor = elemento.columnas[columna.key];

    // Manejo especial para estadoVisibilidadAdmin
    if (columna.key === 'estadoVisibilidadAdmin') {
      if (columna.type === 'status-dot') {
        return 'flex flex-row justify-start items-center gap-2 w-auto';
      }
      return valor === 'true'
        ? 'bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-xs font-medium'
        : 'bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-full text-xs font-medium';
    }

    // Manejo para estadoRevision
    if (columna.key === 'estadoRevision') {
      switch (valor) {
        case 'aprobado':
          return 'bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-xs font-medium';
        case 'pendiente':
          return 'bg-yellow-100 text-yellow-800 px-2.5 py-0.5 rounded-full text-xs font-medium';
        case 'rechazado':
          return 'bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full text-xs font-medium';
        default:
          return 'bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-full text-xs font-medium';
      }
    }

    // Estado por defecto
    return 'bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-full text-xs font-medium';
  }

  getStatusDotClasses(elemento: ElementoTabla, columna: ColumnaConfig): string {
    if (columna.type !== 'status-dot') return '';

    const valor = elemento.columnas[columna.key]?.toString().toUpperCase();

    if (columna.key === 'estadoVisibilidadAdmin') {
      switch (valor) {
        case 'VISIBLE':
          return 'inline-flex items-center justify-center font-semibold leading-none w-2 h-2 text-white rounded-full bg-green-600';
        case 'PENDIENTE':
          return 'inline-flex items-center justify-center font-semibold leading-none w-2 h-2 text-white rounded-full bg-yellow-500';
        case 'OCULTO':
          return 'inline-flex items-center justify-center font-semibold leading-none w-2 h-2 text-white rounded-full bg-red-600';
        default:
          return 'inline-flex items-center justify-center font-semibold leading-none w-2 h-2 text-white rounded-full bg-gray-500';
      }
    }

    return 'inline-flex items-center justify-center font-semibold leading-none w-2 h-2 text-white rounded-full bg-gray-500';
  }

  getStatusTextClasses(
    elemento: ElementoTabla,
    columna: ColumnaConfig
  ): string {
    if (columna.type !== 'status-dot') return '';

    const valor = elemento.columnas[columna.key]?.toString().toUpperCase();

    if (columna.key === 'estadoVisibilidadAdmin') {
      switch (valor) {
        case 'VISIBLE':
          return 'text-sm font-medium capitalize text-green-700';
        case 'PENDIENTE':
          return 'text-sm font-medium capitalize text-yellow-700';
        case 'OCULTO':
          return 'text-sm font-medium capitalize text-red-700';
        default:
          return 'text-sm font-medium capitalize text-gray-700';
      }
    }

    return 'text-sm font-medium capitalize text-gray-700';
  }

  // Métodos para el ordenamiento
  ordenarPorColumna(columna: ColumnaConfig): void {
    if (!columna.sortable) return;

    if (this.columnaOrdenada === columna.key) {
      this.ordenAscendente = !this.ordenAscendente;
    } else {
      this.columnaOrdenada = columna.key;
      this.ordenAscendente = true;
    }

    this.elementosTabla.sort((a, b) => {
      const valorA = a.columnas[columna.key];
      const valorB = b.columnas[columna.key];

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

  obtenerIconoOrdenamiento(columna: ColumnaConfig): string {
    if (!columna.sortable || this.columnaOrdenada !== columna.key) {
      return 'bi-arrow-down-up text-gray-400';
    }
    return this.ordenAscendente
      ? 'bi-arrow-down text-blue-600'
      : 'bi-arrow-up text-blue-600';
  }

  // Método para actualizar el estado de un elemento después de enviar la solicitud
  actualizarEstadoElemento(elemento: ElementoTabla, nuevoEstado: string): void {
    const index = this.elementosTabla.findIndex(
      (e) => e.columnas['elementoId'] === elemento.columnas['elementoId']
    );

    if (index !== -1) {
      // Actualizar el estado del elemento
      this.elementosTabla[index] = {
        ...this.elementosTabla[index],
        columnas: {
          ...this.elementosTabla[index].columnas,
          estadoRevision: nuevoEstado,
          estadoVisibilidadAdmin: nuevoEstado,
        },
      };

      // Forzar la detección de cambios
      this.elementosTabla = [...this.elementosTabla];
      // Emitir el evento de cambio de selección para actualizar la vista
      this.emitirCambioSeleccion();
    }
  }
}
