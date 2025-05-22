import { NgClass, NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { SvgIconComponent } from 'angular-svg-icon';
import { ElementoRevision } from '../../../core/models/revision/elemento-revision.model';

@Component({
  selector: 'app-collapse-card',
  standalone: true,
  imports: [NgIf, NgClass, SvgIconComponent],
  templateUrl: './collapse-card.component.html',
})
export class CollapseCardComponent implements OnInit {
  @Input() elementosRevision: ElementoRevision = {} as ElementoRevision;

  // Variables
  public isExpanded = false;

  toggleCollapse(): void {
    this.isExpanded = !this.isExpanded;
  }

  ngOnInit(): void {
    console.log('ElementosRevision', this.elementosRevision);
  }
}
