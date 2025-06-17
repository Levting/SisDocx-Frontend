import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FusionModalService } from '../../services/fusion-modal.service';

@Component({
  selector: 'app-fusion-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fusion-modal.component.html',
})
export class FusionModalComponent {
  private fusionModalService = inject(FusionModalService);
  public isOpen$ = this.fusionModalService.isOpen$;
  public config$ = this.fusionModalService.config$;

  onDownload(): void {
    this.fusionModalService.download();
  }

  onSave(): void {
    this.fusionModalService.save();
  }

  onCancel(): void {
    this.fusionModalService.cancel();
  }
}
