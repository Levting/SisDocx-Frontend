import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { SvgIconComponent } from 'angular-svg-icon';
import { ElementoTabla } from '../../models/table/elemento-tabla.model';

@Component({
  selector: 'app-collapse-card',
  standalone: true,
  imports: [CommonModule, SvgIconComponent],
  templateUrl: './collapse-card.component.html',
})
export class CollapseCardComponent implements OnInit {
  @Input() elementosRevision: ElementoTabla = {} as ElementoTabla;

  // Variables
  public isExpanded = false;

  toggleCollapse(): void {
    this.isExpanded = !this.isExpanded;
  }

  ngOnInit(): void {
    console.log('ElementosRevision', this.elementosRevision);
  }
}
