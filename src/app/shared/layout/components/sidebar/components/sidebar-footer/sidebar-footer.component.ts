import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-sidebar-footer',
  standalone: true,
  templateUrl: './sidebar-footer.component.html',
})
export class SidebarFooterComponent {
  @Output() toggleSidebar = new EventEmitter<void>();

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }
}
