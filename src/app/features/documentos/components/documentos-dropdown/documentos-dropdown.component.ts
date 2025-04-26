import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-documentos-dropdown',
  standalone: true,
  imports: [],
  templateUrl: './documentos-dropdown.component.html',
})
export class DocumentosDropdownComponent {
  @Input() carpetaId!: number; // ID de la carpeta
  @Output() confirmarPapelera = new EventEmitter<number>();
  @Output() favorito = new EventEmitter<number>();
  @Output() descargar = new EventEmitter<number>();
  @Output() cambiarNombre = new EventEmitter<number>();
  @Output() mover = new EventEmitter<number>();

  public isOpen: boolean = false;

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
  }

  closeDropdown(): void {
    this.isOpen = false;
  }

  onPapelera(): void {
    this.confirmarPapelera.emit(this.carpetaId);
    this.closeDropdown();
  }

  onFavorito(): void {
    this.favorito.emit(this.carpetaId);
    this.closeDropdown();
  }

  onDescargar(): void {
    this.descargar.emit(this.carpetaId);
    this.closeDropdown();
  }

  onCambiarNombre(): void {
    this.cambiarNombre.emit(this.carpetaId);
    this.closeDropdown();
  }

  onMover(): void {
    this.mover.emit(this.carpetaId);
    this.closeDropdown();
  }
}
