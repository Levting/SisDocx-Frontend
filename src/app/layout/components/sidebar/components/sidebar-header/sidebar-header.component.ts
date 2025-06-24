import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NgIf, NgClass } from '@angular/common';

@Component({
  selector: 'app-sidebar-header',
  standalone: true,
  imports: [NgIf, NgClass],
  templateUrl: './sidebar-header.component.html',
})
export class SidebarHeaderComponent {
  @Input() showSideBar: boolean = true;
  @Output() toggleSidebar = new EventEmitter<void>();

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }
}
