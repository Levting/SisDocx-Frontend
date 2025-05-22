import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-documentos-breadcrum',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './documentos-breadcrum.component.html',
})
export class DocumentosBreadcrumComponent {
  @Input() ruta: { nombre: string; elementoId: number; elemento: 'CARPETA' }[] =
    [];
  @Output() navegar = new EventEmitter<number>();
  @Output() irRaiz = new EventEmitter<void>();

  navegarA(index: number): void {
    this.navegar.emit(index);
  }

  irARaiz(): void {
    this.irRaiz.emit();
  }
}
