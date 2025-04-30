import { Component, OnInit } from '@angular/core';
import { DropdownComponent } from '../../../../shared/components/dropdown/dropdown.component';

@Component({
  selector: 'app-documentos-dropdown',
  standalone: true,
  imports: [DropdownComponent],
  templateUrl: './documentos-dropdown.component.html',
})
export class DocumentosDropdownComponent implements OnInit {
  public items = [
    {
      texto: 'Mover a Papelera',
      icono: 'assets/icons/trash.svg',
      accion: () => this.onPapelera(),
    },
    {
      texto: 'Favorito',
      icono: 'assets/icons/trash.svg',
      accion: () => this.onFavorito(),
    },
    {
      texto: 'Descargar',
      icono: 'assets/icons/trash.svg',
      accion: () => this.onDescargar(),
    },
    {
      texto: 'Cambiar Nombre',
      icono: 'assets/icons/trash.svg',
      accion: () => this.onCambiarNombre(),
    },
  ];

  ngOnInit(): void {
    /* console.log('Items del dropdown:', this.items); */
  }

  onPapelera(): void {
    console.log('Mover a Papelera');
    // Implementar lógica para abrir el elemento
  }

  onFavorito(): void {
    console.log('Favorito');
    // Implementar lógica para abrir la ubicación
  }

  onDescargar(): void {
    console.log('Descargar');
    // Implementar lógica para quitar el elemento de favoritos
  }

  onCambiarNombre(): void {
    console.log('Cambiar Nombre');
    // Implementar lógica para cambiar el nombre
  }
}
