import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Tab {
  id: string;
  label: string;
  active?: boolean;
  icon?: string; // Optional icon for the tab
  disabled?: boolean; // Optional disabled state
}

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabs.component.html',
})
export class TabsComponent {
  @Input() tabs: Tab[] = [];
  @Output() tabChange = new EventEmitter<Tab>();

  onTabClick(tab: Tab): void {
    if (tab.disabled) return;

    // Update active state of tabs
    this.tabs = this.tabs.map((t) => ({
      ...t,
      active: t.id === tab.id,
    }));

    // Emit the change event
    this.tabChange.emit(tab);
  }

  getTabClasses(tab: Tab): string {
    const baseClasses =
      'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm focus:outline-none';
    const activeClasses = 'border-indigo-500 text-indigo-600';
    const inactiveClasses =
      'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';
    const disabledClasses = 'opacity-50 cursor-not-allowed';

    return `${baseClasses} ${tab.active ? activeClasses : inactiveClasses} ${
      tab.disabled ? disabledClasses : ''
    }`;
  }
}
