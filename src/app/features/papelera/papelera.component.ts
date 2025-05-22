import { Component } from '@angular/core';
import { PapeleraTableComponent } from './components/papelera-table/papelera-table.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-papelera',
  standalone: true,
  imports: [PapeleraTableComponent, ConfirmModalComponent],
  templateUrl: './papelera.component.html',
})
export class PapeleraComponent {}
