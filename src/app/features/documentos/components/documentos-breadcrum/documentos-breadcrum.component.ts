import { NgFor } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CarpetaActualService } from '../../../../core/services/carpeta-actual.service';
import { Carpeta } from '../../../../core/models/documentos/carpeta';

@Component({
  selector: 'app-documentos-breadcrum',
  standalone: true,
  imports: [NgFor],
  templateUrl: './documentos-breadcrum.component.html',
})
export class DocumentosBreadcrumComponent {
  @Input() ruta: { nombre: string; elementoId: number }[] = [];
  @Output() navegar = new EventEmitter<number>();
  @Output() irRaiz = new EventEmitter<void>();

  // inyección de servicios
  private carpetaActualService: CarpetaActualService = inject(CarpetaActualService);

  navegarA(index: number): void {
    this.navegar.emit(index);
  }

  irARaiz(): void {
    this.irRaiz.emit();
  }

  // En tu componente donde manejas el breadcrumb
  actualizarCarpetaDesdeBreadcrumb(carpeta: Carpeta): void {
    this.carpetaActualService.actualizarCarpetaDesdeBreadcrumb(carpeta);
    // Aquí también puedes recargar el contenido si es necesario
    this.carpetaActualService.recargarContenidoActual();
  }
}
