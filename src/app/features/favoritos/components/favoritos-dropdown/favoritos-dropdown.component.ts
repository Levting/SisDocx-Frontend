import { Component, OnInit } from '@angular/core';
import { DropdownComponent } from '../../../../shared/components/dropdown/dropdown.component';

@Component({
  selector: 'app-favoritos-dropdown',
  standalone: true,
  imports: [DropdownComponent],
  templateUrl: './favoritos-dropdown.component.html',
})
export class FavoritosDropdownComponent implements OnInit {

  public items = [
    {
      texto: 'Abrir',
      icono: 'assets/icons/trash.svg',
      accion: () => this.abrir(),
    },
    {
      texto: 'Abrir Ubicación',
      icono: 'assets/icons/trash.svg',
      accion: () => this.abrirUbicacion(),
    },
    {
      texto: 'Quitar de Favoritos',
      icono: 'assets/icons/trash.svg',
      accion: () => this.quitarDeFavoritos(),
    },
  ];

  ngOnInit(): void {
    /* console.log('Items del dropdown:', this.items); */
  }

  abrir(): void {
    console.log('Abrir elemento');
    // Implementar lógica para abrir el elemento
  }

  abrirUbicacion(): void {
    console.log('Abrir ubicación del elemento');
    // Implementar lógica para abrir la ubicación
  }

  quitarDeFavoritos(): void {
    console.log('Quitar de favoritos');
    // Implementar lógica para quitar el elemento de favoritos
  }
}
