import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmModalService } from '../../services/confirm-modal.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './confirm-modal.component.html',
})
export class ConfirmModalComponent {
  private confirmModalService = inject(ConfirmModalService);
  public isOpen$ = this.confirmModalService.isOpen$;
  public config$ = this.confirmModalService.config$;
  public observaciones: string = '';

  onConfirm(): void {
    this.confirmModalService.confirm(this.observaciones);
    this.observaciones = '';
  }

  onCancel(): void {
    this.confirmModalService.cancel();
    this.observaciones = '';
  }
}
