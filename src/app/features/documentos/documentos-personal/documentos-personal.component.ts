import { Component, inject } from '@angular/core';
import { LoggerService } from '../../../core/services/logger.service';
import { DocumentosTablaEstadosPersonalComponent } from './components/documentos-tabla-estados-personal/documentos-tabla-estados-personal.component';
import { ConfirmModalComponent } from "../../../shared/components/confirm-modal/confirm-modal.component";

@Component({
  selector: 'app-documentos-personal',
  standalone: true,
  imports: [DocumentosTablaEstadosPersonalComponent, ConfirmModalComponent],
  templateUrl: './documentos-personal.component.html',
})
export class DocumentosPersonalComponent {
  private logger: LoggerService = inject(LoggerService);

  ngOnInit(): void {
    /* this.logger.info('DocumentosPersonalComponent'); */
  }
}
