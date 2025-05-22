import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ConfirmModalConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmModalService {
  private isOpenSubject = new BehaviorSubject<boolean>(false);
  private configSubject = new BehaviorSubject<ConfirmModalConfig>({
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
  });
  private confirmCallback: (() => void) | null = null;

  isOpen$ = this.isOpenSubject.asObservable();
  config$ = this.configSubject.asObservable();

  open(config: ConfirmModalConfig, onConfirm: () => void): void {
    this.configSubject.next(config);
    this.confirmCallback = onConfirm;
    this.isOpenSubject.next(true);
  }

  close(): void {
    this.isOpenSubject.next(false);
    this.confirmCallback = null;
  }

  confirm(): void {
    if (this.confirmCallback) {
      this.confirmCallback();
    }
    this.close();
  }
}
