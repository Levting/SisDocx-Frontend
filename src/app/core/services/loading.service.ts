import { Injectable } from '@angular/core';
import NProgress from 'nprogress';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  constructor() {
    // Configurar NProgress
    NProgress.configure({
      showSpinner: false,
      minimum: 0.1,
      easing: 'ease',
      speed: 500,
      trickleSpeed: 200,
    });
  }

  start(): void {
    NProgress.start();
  }

  done(): void {
    NProgress.done();
  }

  set(value: number): void {
    NProgress.set(value);
  }

  inc(): void {
    NProgress.inc();
  }
}
