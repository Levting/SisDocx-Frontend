import { Component, OnDestroy, OnInit } from '@angular/core';
import { PapeleraTableComponent } from './components/papelera-table/papelera-table.component';

@Component({
  selector: 'app-papelera',
  standalone: true,
  imports: [PapeleraTableComponent, PapeleraTableComponent],
  templateUrl: './papelera.component.html',
})
export class PapeleraComponent implements OnInit, OnDestroy {
  ngOnInit(): void {}

  ngOnDestroy() {}
}
