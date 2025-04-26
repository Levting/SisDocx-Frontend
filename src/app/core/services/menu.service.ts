import { Injectable, OnDestroy, signal } from '@angular/core';
import { MenuItem } from '../models/menu/menu';
import { Subscription } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { Menu } from '../constants/menu';

@Injectable({
  providedIn: 'root',
})
export class MenuService implements OnDestroy{
  private _showSidebar = signal(true);
  private _pagesMenu = signal<MenuItem[]>([]);
  private _subscription = new Subscription();

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
 
  get pagesMenu() {
    return this._pagesMenu();
  }

  set showSideBar(value: boolean) {
    this._showSidebar.set(value);
  }

  public toggleSidebar() {
    this._showSidebar.set(!this._showSidebar());
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
