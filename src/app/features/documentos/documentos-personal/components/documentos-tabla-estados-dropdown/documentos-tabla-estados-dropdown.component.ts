import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DropdownComponent } from '../../../../../shared/components/dropdown/dropdown.component';
import { ElementoTabla } from '../../../../../shared/models/table/elemento-tabla.model';
import { DocumentosModalRenombrarComponent } from '../../../documentos-admin/components/documentos-modal-renombrar/documentos-modal-renombrar.component';

@Component({
  selector: 'app-documentos-tabla-estados-dropdown',
  standalone: true,
  imports: [DropdownComponent, DocumentosModalRenombrarComponent],
  templateUrl: './documentos-tabla-estados-dropdown.component.html',
})
export class DocumentosTablaEstadosDropdownComponent {
  @Input() elemento!: ElementoTabla;
  @Output() onPapelera = new EventEmitter<ElementoTabla>();
  @Output() onDescargar = new EventEmitter<ElementoTabla>();
  @Output() onRenombrar = new EventEmitter<ElementoTabla>();
  @Output() onEnviarRevision = new EventEmitter<ElementoTabla>();

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
      icono: 'assets/icons/object.svg',
      accion: () => this.abrirModalRenombrar(),
    },
    {
      texto: 'Revisar',
      icono: 'assets/icons/send.svg',
      accion: () => this.onEnviarRevision.emit(this.elemento),
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
