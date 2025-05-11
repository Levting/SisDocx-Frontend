import { Component, inject } from '@angular/core';
import { DocumentosTableComponent } from './components/documentos-table/documentos-table.component';
import { DocumentosPorUsuarioTableComponent } from './components/documentos-por-usuario-table/documentos-por-usuario-table.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { LoggerService } from '../../core/services/logger.service';
import {
  TabsComponent,
  Tab,
} from '../../shared/components/tabs/tabs.component';
import { NgIf } from '@angular/common';
import { CarpetaActualService } from '../../core/services/carpeta-actual.service';

@Component({
  selector: 'app-documentos',
  standalone: true,
  imports: [
    DocumentosTableComponent,
    DocumentosPorUsuarioTableComponent,
    ConfirmModalComponent,
    TabsComponent,
    NgIf,
  ],
  templateUrl: './documentos.component.html',
})
export class DocumentosComponent {
  private logger: LoggerService = inject(LoggerService);
  private carpetaActualService: CarpetaActualService =
    inject(CarpetaActualService);
  // Configuración de tabs
  public tabs: Tab[] = [
    { id: 'documentos', label: 'Por Equipo de Distribución', active: true },
    { id: 'documentos-por-usuario', label: 'Por Usuario' },
  ];
  public activeTab: string = 'documentos';

  // Propiedades para modales
  public isSubirArchivoModalOpen: boolean = false;
  public isSubirCarpetaModalOpen: boolean = false;
  public carpetaPadreId: number = 0;

  // Cuando el usuario de click en el tab, esta recargara el contenido de la carpeta raiz
  onReload(): void {}

  onTabChange(tab: Tab): void {
    this.activeTab = tab.id;
    this.logger.info(`Cambiando a la pestaña: ${tab.label}`);
  }

  openSubirArchivoModal(carpetaPadreId: number): void {
    this.carpetaPadreId = carpetaPadreId;
    this.isSubirArchivoModalOpen = true;
    this.logger.debug(
      'Abriendo modal de subir archivo para carpeta:',
      carpetaPadreId
    );
  }

  openSubirCarpetaModal(carpetaPadreId: number): void {
    this.carpetaPadreId = carpetaPadreId;
    this.isSubirCarpetaModalOpen = true;
    this.logger.debug(
      'Abriendo modal de subir carpeta para carpeta:',
      carpetaPadreId
    );
  }

  onArchivosSubidos(): void {
    this.isSubirArchivoModalOpen = false;
    this.logger.debug('Archivos subidos correctamente');
  }

  onCarpetasSubidas(): void {
    this.isSubirCarpetaModalOpen = false;
    this.logger.debug('Carpetas subidas correctamente');
  }
}
