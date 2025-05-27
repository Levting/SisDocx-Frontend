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
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Carpeta } from '../../../../../core/models/documentos/carpeta.model';
import { MenuService } from '../../../../../core/services/menu.service';
import { RoleService } from '../../../../../core/services/role.service';

interface MenuItem {
  label: string;
  route: string;
  icon: string;
  active: boolean;
  roles: string[];
}

interface MenuGroup {
  group: string;
  items: MenuItem[];
}

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
  private roleService = inject(RoleService);

  /**
   * Inicializar el componente
   */
  ngOnInit(): void {
    this.initializeMenuItems();
  }

  private filterItemsByRole(items: MenuGroup[], userRole: string): MenuGroup[] {
    return items
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) => !item.roles || item.roles.includes(userRole)
        ),
      }))
      .filter((group) => group.items.length > 0);
  }

  private initializeMenuItems(): void {
    const menuItems: MenuGroup[] = [
      {
        group: 'Navegación',
        items: [
          {
            label: 'Inicio',
            route: '',
            icon: 'assets/icons/home.svg',
            active: true,
            roles: ['Administrador', 'Personal'],
          },
          {
            label: 'Mis Archivos',
            route: '/documentos',
            icon: 'assets/icons/document.svg',
            active: false,
            roles: ['Administrador'],
          },
          {
            label: 'Mis Archivos',
            route: '/documentos-personal',
            icon: 'assets/icons/document.svg',
            active: false,
            roles: ['Personal'],
          },
          {
            label: 'Situación Revisión',
            route: '/documentos-situacion',
            icon: 'assets/icons/document.svg',
            active: false,
            roles: ['Personal'],
          },
          {
            label: 'Por Aprobar',
            route: '/documentos-por-aprobar',
            icon: 'assets/icons/object.svg',
            active: false,
            roles: ['Administrador'],
          },
          /* {
            label: 'Favoritos',
            route: '/favoritos',
            icon: 'assets/icons/star.svg',
            active: false,
            roles: ['Administrador', 'Personal'],
          }, */
          {
            label: 'Papelera',
            route: '/papelera',
            icon: 'assets/icons/object.svg',
            active: false,
            roles: ['Administrador', 'Personal'],
          },
        ],
      },
      {
        group: 'Administración',
        items: [
          {
            label: 'Campaña de Medición',
            route: '/campana-medicion',
            icon: 'assets/icons/object.svg',
            active: false,
            roles: ['Administrador'],
          },
          {
            label: 'Fusión de Archivos',
            route: '/fusion',
            icon: 'assets/icons/object.svg',
            active: false,
            roles: ['Administrador'],
          },
        ],
      },
      {
        group: 'Ajustes',
        items: [
          {
            label: 'Ajustes',
            route: '/ajustes',
            icon: 'assets/icons/settings.svg',
            active: false,
            roles: ['Administrador'],
          },
        ],
      },
    ];

    this.roleService.currentUser$.subscribe((user) => {
      const userRole = user?.rol?.nombre || '';
      const filteredItems = this.filterItemsByRole(menuItems, userRole);
      this.menuService.updateMenuItems(filteredItems);
    });
  }

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
}
