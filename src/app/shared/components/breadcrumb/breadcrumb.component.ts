import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from 'angular-svg-icon';

interface RutaSegmento {
  nombre: string;
  elementoId: number;
  elemento: 'CARPETA';
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './breadcrumb.component.html',
})
export class BreadcrumbComponent {
  @Input() ruta: RutaSegmento[] = [];
  @Output() navegar = new EventEmitter<number>();
  @Output() irRaiz = new EventEmitter<void>();

  onNavegar(index: number) {
    this.navegar.emit(index);
  }

  onIrRaiz() {
    this.irRaiz.emit();
  }
}
