import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ConfirmModalConfig {
  title: string;
  message: string;
  type?: 'success' | 'warning' | 'danger' | 'info';
  confirmText?: string;
  cancelText?: string;
  showInput?: boolean;
  inputPlaceholder?: string;
}

export interface ConfirmModalResult {
  confirmed: boolean;
  input?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmModalService {
  private isOpenSubject = new BehaviorSubject<boolean>(false);
  private configSubject = new BehaviorSubject<ConfirmModalConfig | null>(null);
  private resultSubject = new BehaviorSubject<ConfirmModalResult | null>(null);

  isOpen$ = this.isOpenSubject.asObservable();
  config$ = this.configSubject.asObservable();

  open(config: ConfirmModalConfig): Observable<ConfirmModalResult> {
    this.configSubject.next(config);
    this.isOpenSubject.next(true);

    return new Observable<ConfirmModalResult>((observer) => {
      const subscription = this.resultSubject.subscribe((result) => {
        if (result) {
          observer.next(result);
          observer.complete();
          this.reset();
        }
      });

      return () => {
        subscription.unsubscribe();
        this.reset();
      };
    });
  }

  confirm(input?: string): void {
    this.resultSubject.next({ confirmed: true, input });
  }

  cancel(): void {
    this.resultSubject.next({ confirmed: false });
  }

  private reset(): void {
    this.isOpenSubject.next(false);
    this.configSubject.next(null);
    this.resultSubject.next(null);
  }
}
