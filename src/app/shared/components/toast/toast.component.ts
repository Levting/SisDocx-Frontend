import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastConfig } from '../../services/toast.service';
import { SvgIconComponent } from 'angular-svg-icon';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './toast.component.html',
})
export class ToastComponent {
  @Input() config: ToastConfig | null = null;

  getIconPath(): string {
    switch (this.config?.type) {
      case 'success':
        return 'assets/icons/trash.svg';
      case 'error':
        return 'assets/icons/trash.svg';
      case 'warning':
        return 'assets/icons/trash.svg';
      case 'info':
        return 'assets/icons/trash.svg';
      default:
        return 'assets/icons/trash.svg';
    }
  }

  getIconColor(): string {
    switch (this.config?.type) {
      case 'success':
        return 'text-green-500 bg-green-100 dark:bg-green-800 dark:text-green-200';
      case 'error':
        return 'text-red-500 bg-red-100 dark:bg-red-800 dark:text-red-200';
      case 'warning':
        return 'text-orange-500 bg-orange-100 dark:bg-orange-700 dark:text-orange-200';
      case 'info':
        return 'text-blue-500 bg-blue-100 dark:bg-blue-800 dark:text-blue-200';
      default:
        return 'text-blue-500 bg-blue-100 dark:bg-blue-800 dark:text-blue-200';
    }
  }
}
