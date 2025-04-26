import { NgFor, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SvgIconComponent } from 'angular-svg-icon';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [SvgIconComponent, NgIf, NgFor], // Aquí puedes agregar los módulos que necesites
  templateUrl: './dropdown.component.html',
})
export class DropdownComponent {
  @Input() items: { texto: string; icono?: string; accion: () => void }[] = []; // Lista de ítems
  public isOpen: boolean = false; // Estado del menú

  toggleDropdown(): void {
    this.isOpen = !this.isOpen; // Alternar el estado del menú
  }
}
