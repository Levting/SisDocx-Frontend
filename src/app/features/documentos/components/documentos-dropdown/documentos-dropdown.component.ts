import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DropdownComponent } from '../../../../shared/components/dropdown/dropdown.component';
import { ElementoTabla } from '../../../../core/models/table/elementoTabla';

@Component({
  selector: 'app-documentos-dropdown',
  standalone: true,
  imports: [DropdownComponent],
  templateUrl: './documentos-dropdown.component.html',
})
export class DocumentosDropdownComponent {
  @Input() elemento!: ElementoTabla;
  @Output() onPapelera = new EventEmitter<ElementoTabla>();
  @Output() onFavorito = new EventEmitter<ElementoTabla>();
  @Output() onDescargar = new EventEmitter<ElementoTabla>();
  @Output() onCambiarNombre = new EventEmitter<ElementoTabla>();

  public items = [
    {
      texto: 'Mover a Papelera',
      icono: 'assets/icons/trash.svg',
      accion: () => this.onPapelera.emit(this.elemento),
    },
    {
      texto: 'Favorito',
      icono: 'assets/icons/trash.svg',
      accion: () => this.onFavorito.emit(this.elemento),
    },
    {
      texto: 'Descargar',
      icono: 'assets/icons/trash.svg',
      accion: () => this.onDescargar.emit(this.elemento),
    },
    {
      texto: 'Cambiar Nombre',
      icono: 'assets/icons/trash.svg',
      accion: () => this.onCambiarNombre.emit(this.elemento),
    },
  ];

  ngOnInit(): void {
    /* console.log('Items del dropdown:', this.items); */
  }
}
