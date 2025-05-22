import { Component, inject } from '@angular/core';
import { LoggerService } from '../../../core/services/logger.service';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';

import {
  Tab,
  TabsComponent,
} from '../../../shared/components/tabs/tabs.component';
import { NgIf } from '@angular/common';
import { DocumentosTableComponent } from "./documentos-table/documentos-table.component";
import { DocumentosAprobadosComponent } from "./documentos-aprobados/documentos-aprobados.component";
@Component({
  selector: 'app-documentos-admin',
  standalone: true,
  imports: [ConfirmModalComponent, TabsComponent, NgIf, DocumentosTableComponent, DocumentosAprobadosComponent],
  templateUrl: './documentos-admin.component.html',
})
export class DocumentosAdminComponent {
  private logger: LoggerService = inject(LoggerService);

  public tabs: Tab[] = [
    { id: 'documentos', label: 'Documentos', active: true },
    { id: 'documentos-por-usuario', label: 'Documentos Aprobados' },
  ];

  public activeTab: string = this.tabs[0].id;

  // Cuando el usuario de click en el tab, esta recargara el contenido de la carpeta raiz
  onReload(): void {}

  onTabChange(tab: Tab): void {
    this.activeTab = tab.id;
    this.logger.info(`Cambiando a la pestaña: ${tab.label}`);
  }
}
