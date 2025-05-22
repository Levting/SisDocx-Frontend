import {
  Component,
  Output,
  TemplateRef,
  Input,
  EventEmitter,
  OnInit,
  inject,
} from '@angular/core';
import { ElementoTabla } from '../../models/table/elemento-tabla.model';
import { CommonModule, NgIf } from '@angular/common';
import { SvgIconComponent } from 'angular-svg-icon';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

interface ColumnaConfig {
  key: string;
  label: string;
  type: 'text' | 'badge' | 'status' | 'actions';
  badgeColor?: string;
  badgeTextColor?: string;
  hidden?: boolean;
}

@Component({
  selector: 'app-tabla-estado',
  standalone: true,
  imports: [NgIf, CommonModule, SvgIconComponent, FormsModule],
  templateUrl: './tabla-estado.component.html',
})
export class TablaEstadoComponent implements OnInit {
  @Input() cabeceras: string[] = [];
  @Input() columnas: string[] = [];
  @Input() elementosTabla: ElementoTabla[] = [];

  @Input() mostrarDropdown: boolean = false;
  @Input() habilitarNavegacion: boolean = false;
  @Input() isLoading: boolean = false;
  @Input() isError: boolean = false;
  @Input() error: string | null = null;

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

  abrirCarpeta(elementoTabla: ElementoTabla): void {
    if (this.habilitarNavegacion) {
      this.dobleClickElemento.emit(elementoTabla);
    }
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

  getAllColumnKeys(elementoTabla: ElementoTabla): string[] {
    return Object.keys(elementoTabla.columnas);
  }

  getBadgeClasses(columna: ColumnaConfig): string {
    if (columna.type !== 'badge') return '';
    return `items-center justify-center font-semibold text-xs ${
      columna.badgeColor || 'bg-green-300'
    } ${
      columna.badgeTextColor || 'text-green-700'
    } rounded-md hidden px-2 py-1 sm:block`;
  }

  getStatusClasses(elemento: ElementoTabla): string {
    const estado = elemento.columnas['estadoRevision'];
    switch (estado) {
      case 'APROBADO':
        return 'bg-green-500';
      case 'RECHAZADO':
        return 'bg-red-500';
      case 'PENDIENTE':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  }
}
