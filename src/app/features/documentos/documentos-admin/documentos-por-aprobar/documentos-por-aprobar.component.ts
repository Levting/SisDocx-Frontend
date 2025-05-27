import { Component, inject, OnInit } from '@angular/core';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { RevisionService } from '../../../../core/services/revision.service';
import { ElementoTabla } from '../../../../shared/models/table/elemento-tabla.model';
import { TransformacionService } from '../../../../core/services/transformacion.service';
import { TablaDesplegableComponent } from '../../../../shared/components/tabla-desplegable/tabla-desplegable.component';
import { DocumentosPreviewModalComponent } from '../components/documentos-preview-modal/documentos-preview-modal.component';
import { CommonModule } from '@angular/common';
import { ConfirmModalService } from '../../../../shared/services/confirm-modal.service';
import { RevisionDesicion } from '../../../../core/models/revision/revision-desicion.model';
import {
  Tab,
  TabsComponent,
} from '../../../../shared/components/tabs/tabs.component';

@Component({
  selector: 'app-documentos-por-aprobar',
  standalone: true,
  imports: [
    ConfirmModalComponent,
    TablaDesplegableComponent,
    DocumentosPreviewModalComponent,
    CommonModule,
    TabsComponent,
  ],
  templateUrl: './documentos-por-aprobar.component.html',
})
export class DocumentosPorAprobarComponent implements OnInit {
  // Variables
  public revisionesPorAprobar: ElementoTabla[] = [];
  public revisionesRechazadas: ElementoTabla[] = [];
  public isOpenPreviewModal: boolean = false;
  public elementoAPrevisualizar: ElementoTabla | null = null;
  public observacionesRechazo: string = '';

  // Inyección de servicios
  private revisionService = inject(RevisionService);
  private transformacionService = inject(TransformacionService);
  private confirmModalService = inject(ConfirmModalService);

  // Tabs

  public tabs: Tab[] = [
    { id: 'por-aprobar', label: 'Por Aprobar', active: true },
      { id: 'rechazadas', label: 'Rechazadas' },
  ];

  public activeTab: string = this.tabs[0].id;

  // Cuando el usuario de click en el tab, esta recargara el contenido de la carpeta raiz
  onReload(): void {}

  onTabChange(tab: Tab): void {
    this.activeTab = tab.id;
  }

  ngOnInit(): void {
    // Cargar las revisiones por aprobar
    this.revisionService
      .obtenerRevisionesPendientes()
      .subscribe((revisiones) => {
        this.revisionesPorAprobar = revisiones.map((revision) =>
          this.transformacionService.transformarATablaRevision(revision)
        );
      });

    // Cargar las revisiones todas
    this.revisionService.obtenerRevisionesRechazadas().subscribe((revisiones) => {
      this.revisionesRechazadas = revisiones.map((revision) =>
        this.transformacionService.transformarATablaRevision(revision)
      );
    });
  }

  // Cerrar el modal de previsualización
  onPreviewClose(): void {
    this.isOpenPreviewModal = false;
    this.elementoAPrevisualizar = null;
  }

  // Ver el archivo
  onVerArchivo(elemento: ElementoTabla): void {
    this.elementoAPrevisualizar = elemento;
    this.isOpenPreviewModal = true;
  }

  // Aprobar la revisión
  onAprobarRevision(revisionId: number): void {
    this.confirmModalService
      .open({
        title: 'Confirmar Aprobación',
        message: '¿Está seguro que desea aprobar esta revisión?',
        type: 'success',
        confirmText: 'Aprobar',
        cancelText: 'Cancelar',
      })
      .subscribe((result) => {
        if (result.confirmed) {
          const decision: RevisionDesicion = {
            revisionId: revisionId,
            estadoRevision: 'APROBADO',
            observaciones: '',
          };

          this.revisionService.revisar(decision).subscribe({
            next: () => {
              // Actualizar la lista de revisiones
              this.revisionService
                .obtenerRevisiones()
                .subscribe((revisiones) => {
                  this.revisionesPorAprobar = revisiones.map((revision) =>
                    this.transformacionService.transformarATablaRevision(
                      revision
                    )
                  );
                });
            },
            error: (error) => {
              console.error('Error al aprobar la revisión:', error);
            },
          });
        }
      });
  }

  // Rechazar la revisión
  onRechazarRevision(revisionId: number): void {
    this.confirmModalService
      .open({
        title: 'Rechazar Revisión',
        message: 'Por favor, ingrese las observaciones del rechazo:',
        type: 'warning',
        confirmText: 'Rechazar',
        cancelText: 'Cancelar',
        showInput: true,
        inputPlaceholder: 'Observaciones del rechazo',
      })
      .subscribe((result) => {
        if (result.confirmed && result.input) {
          const decision: RevisionDesicion = {
            revisionId: revisionId,
            estadoRevision: 'RECHAZADO',
            observaciones: result.input,
          };

          this.revisionService.revisar(decision).subscribe({
            next: () => {
              // Actualizar la lista de revisiones
              this.revisionService
                .obtenerRevisiones()
                .subscribe((revisiones) => {
                  this.revisionesPorAprobar = revisiones.map((revision) =>
                    this.transformacionService.transformarATablaRevision(
                      revision
                    )
                  );
                });
            },
            error: (error) => {
              console.error('Error al rechazar la revisión:', error);
            },
          });
        }
      });
  }
}
