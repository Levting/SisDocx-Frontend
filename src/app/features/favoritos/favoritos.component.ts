import { Component } from '@angular/core';
import { FavoritosTableComponent } from "./components/favoritos-table/favoritos-table.component";

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [FavoritosTableComponent],
  templateUrl: './favoritos.component.html',
})
export class FavoritosComponent {

}
