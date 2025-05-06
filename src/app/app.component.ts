import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast.component';
import { ToastService } from './shared/services/toast.service';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent, AsyncPipe],
  template: `
    <router-outlet></router-outlet>
    <app-toast [config]="toastService.toast$ | async"></app-toast>`,
})
export class AppComponent {
  constructor(public toastService: ToastService) {}
}
