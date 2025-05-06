import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastConfig {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastSubject = new BehaviorSubject<ToastConfig | null>(null);
  toast$ = this.toastSubject.asObservable();

  show(config: ToastConfig) {
    this.toastSubject.next(config);
    if (config.duration) {
      setTimeout(() => this.hide(), config.duration);
    }
  }

  hide() {
    this.toastSubject.next(null);
  }
}
