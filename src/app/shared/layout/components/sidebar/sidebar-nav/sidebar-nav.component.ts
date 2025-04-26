import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { Carpeta } from '../../../../../core/models/documentos/carpeta';
import { MenuService } from '../../../../../core/services/menu.service';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar-nav',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    NgClass,
    AngularSvgIconModule,
    NgTemplateOutlet,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './sidebar-nav.component.html',
})
export class SidebarNavComponent implements OnInit {
  // Recibir datos del sidebar
  @Input() showSideBar: boolean = true;
  @Input() carpetaActual: Carpeta | null = null;
  @Input() dropdownOpen: boolean = false;

  // Outputs (Enviar datos al sidebar
  @Output() cargarContenidoRaiz = new EventEmitter<void>();
  @Output() toggleDropdown = new EventEmitter<void>();
  @Output() itemClick = new EventEmitter<void>();

  // Inyectar servicios
  public menuService = inject(MenuService);

  /**
   * Emitir el evento de click en un item
   */
  onItemClick(): void {
    this.itemClick.emit();
  }

  /**
   * Emitir el evento de cargar el contenido de la raíz
   */
  onCargarContenidoRaiz(): void {
    this.cargarContenidoRaiz.emit();
  }

  /**
   * Emitir el evento de togglear el dropdown
   */
  onToggleDropdown(): void {
    this.toggleDropdown.emit();
  }

  /**
   * Inicializar el componente
   */
  ngOnInit(): void {}
}
