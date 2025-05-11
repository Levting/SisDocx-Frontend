import { Injectable, OnDestroy, signal } from '@angular/core';
import { Subscription, BehaviorSubject } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { Menu } from '../constants/menu';
import { MenuItem } from '../../shared/models/menu/menu.model';

@Injectable({
  providedIn: 'root',
})
export class MenuService implements OnDestroy {
  private _showSidebar = signal(true);
  private _pagesMenu = signal<MenuItem[]>([]);
  private _subscription = new Subscription();
  private pagesMenuSubject = new BehaviorSubject<MenuItem[]>([]);
  public pagesMenu$ = this.pagesMenuSubject.asObservable();

  constructor(private router: Router) {
    /* Definir un menu dinamico */
    this._pagesMenu.set(Menu.pages);

    let subscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this._pagesMenu.set(Menu.pages);
      }
    });

    this._subscription.add(subscription);
  }

  get showSideBar() {
    return this._showSidebar();
  }

  get pagesMenu(): MenuItem[] {
    return this.pagesMenuSubject.getValue();
  }

  set showSideBar(value: boolean) {
    this._showSidebar.set(value);
  }

  public toggleSidebar() {
    this._showSidebar.set(!this._showSidebar());
  }

  updateMenuItems(items: MenuItem[]): void {
    this.pagesMenuSubject.next(items);
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
