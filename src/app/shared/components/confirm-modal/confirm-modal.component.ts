import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmModalService } from '../../services/confirm-modal.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.component.html',
})
export class ConfirmModalComponent implements OnInit {
  isOpen$: Observable<boolean>;
  config$: Observable<any>;

  constructor(private confirmModalService: ConfirmModalService) {
    this.isOpen$ = this.confirmModalService.isOpen$;
    this.config$ = this.confirmModalService.config$;
  }

  ngOnInit(): void {}

  onConfirm(): void {
    this.confirmModalService.confirm();
  }

  onCancel(): void {
    this.confirmModalService.close();
  }
}
