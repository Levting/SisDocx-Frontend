import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { PapeleraTableComponent } from './components/papelera-table/papelera-table.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { LoggerService } from '../../core/services/logger.service';

@Component({
  selector: 'app-papelera',
  standalone: true,
  imports: [PapeleraTableComponent, ConfirmModalComponent],
  templateUrl: './papelera.component.html',
})
export class PapeleraComponent implements OnInit, OnDestroy {
  private logger: LoggerService = inject(LoggerService);

  ngOnInit(): void {
    this.logger.debug('Inicializando componente Papelera');
  }

  ngOnDestroy(): void {
    this.logger.debug('Destruyendo componente Papelera');
  }
}
