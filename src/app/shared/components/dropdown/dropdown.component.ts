import { NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SvgIconComponent } from 'angular-svg-icon';
import { ClickOutsideDirective } from '../../../core/directives/click-outside.directive';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [SvgIconComponent, NgIf, NgFor, ClickOutsideDirective],
  templateUrl: './dropdown.component.html',
})
export class DropdownComponent {
  @Input() items: { texto: string; icono?: string; accion: () => void }[] = []; // Lista de ítems
  public isOpen: boolean = false; // Estado del menú

  toggleDropdown(): void {
    this.isOpen = !this.isOpen; // Alternar el estado del menú
  }

  closeDropdown(): void {
    this.isOpen = false; // Cerrar el menú
  }
}
