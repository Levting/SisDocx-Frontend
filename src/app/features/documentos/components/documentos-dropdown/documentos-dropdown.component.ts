import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DropdownComponent } from '../../../../shared/components/dropdown/dropdown.component';
import { ElementoTabla } from '../../../../core/models/table/elementoTabla';
import { DocumentosModalRenombrarComponent } from '../documentos-modal-renombrar/documentos-modal-renombrar.component';

@Component({
  selector: 'app-documentos-dropdown',
  standalone: true,
  imports: [DropdownComponent, DocumentosModalRenombrarComponent],
  templateUrl: './documentos-dropdown.component.html',
})
export class DocumentosDropdownComponent {
  @Input() elemento!: ElementoTabla;
  @Output() onPapelera = new EventEmitter<ElementoTabla>();
  @Output() onDescargar = new EventEmitter<ElementoTabla>();
  @Output() onRenombrar = new EventEmitter<ElementoTabla>();

  public isModalRenombrarOpen: boolean = false;

  public items = [
    {
      texto: 'Mover a Papelera',
      icono: 'assets/icons/trash.svg',
      accion: () => this.onPapelera.emit(this.elemento),
    },
    {
      texto: 'Descargar',
      icono: 'assets/icons/download.svg',
      accion: () => this.onDescargar.emit(this.elemento),
    },
    {
      texto: 'Cambiar Nombre',
      icono: 'assets/icons/rename.svg',
      accion: () => this.abrirModalRenombrar(),
    },
  ];

  abrirModalRenombrar(): void {
    this.isModalRenombrarOpen = true;
  }

  onModalRenombrarClose(): void {
    this.isModalRenombrarOpen = false;
  }

  onElementoRenombrado(elemento: ElementoTabla): void {
    this.isModalRenombrarOpen = false;
    this.elemento = { ...elemento };
    this.onRenombrar.emit(this.elemento);
  }
}
