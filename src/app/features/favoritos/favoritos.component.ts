import { Component, inject } from '@angular/core';
import { FavoritosTableComponent } from './components/favoritos-table/favoritos-table.component';
import { LoggerService } from '../../core/services/logger.service';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [FavoritosTableComponent],
  templateUrl: './favoritos.component.html',
})
export class FavoritosComponent {
  private logger: LoggerService = inject(LoggerService);

  constructor() {
    this.logger.debug('Inicializando componente Favoritos');
  }
}
