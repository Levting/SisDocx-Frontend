import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface FusionModalConfig {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  downloadText: string;
  saveText: string;
  blob?: Blob;
  filename?: string;
}

@Injectable({
  providedIn: 'root',
})
export class FusionModalService {
  private isOpenSubject = new BehaviorSubject<boolean>(false);
  private configSubject = new BehaviorSubject<FusionModalConfig | null>(null);
  private resultSubject = new BehaviorSubject<
    'download' | 'save' | 'cancel' | null
  >(null);

  public isOpen$ = this.isOpenSubject.asObservable();
  public config$ = this.configSubject.asObservable();

  open(config: FusionModalConfig): Observable<'download' | 'save' | 'cancel'> {
    this.configSubject.next(config);
    this.isOpenSubject.next(true);
    return new Observable((observer) => {
      const subscription = this.resultSubject.subscribe((result) => {
        if (result) {
          observer.next(result);
          if (result === 'cancel') {
            this.close();
          }
        }
      });
      return () => subscription.unsubscribe();
    });
  }

  download(): void {
    this.resultSubject.next('download');
  }

  save(): void {
    this.resultSubject.next('save');
    this.close();
  }

  cancel(): void {
    this.resultSubject.next('cancel');
  }

  close(): void {
    this.isOpenSubject.next(false);
    this.configSubject.next(null);
    this.resultSubject.next(null);
  }
}
