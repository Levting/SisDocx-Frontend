import {Injectable, OnDestroy, signal} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {MenuItem, SubMenuItem} from '../../models/menu/menu';
import {Subscription} from 'rxjs';
import {Menu} from '../constants/menu';

@Injectable({
  providedIn: 'root',
})
export class MenuService implements OnDestroy {
  private showSidebar = signal(true);
  private pagesMenu = signal<MenuItem[]>([])
  private subscription = new Subscription();

  constructor(private router: Router) {

    // Menu dinámico
    this.pagesMenu.set(Menu.pages);

    let sub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Expandir el menu en base a la activacion de la ruta
        this.pagesMenu().forEach((menu: MenuItem): void => {
          let activeGroup: boolean = false;
          menu.items.forEach((subMenu: SubMenuItem): void => {
            const active: boolean = this.isActive(subMenu.route);
            subMenu.expanded = active;
            subMenu.active = active;
            if (active) {
              activeGroup = true;
            }
            if (subMenu.children) {
              this.expand(subMenu.children);
            }
          })
        })
      }
    })
    this.subscription.add(sub)
  }

  get showSideBar(): boolean {
    return this.showSidebar();
  }

  public toggleSidebar() {
    this.showSidebar.set(!this.showSidebar());
  }

  private expand(items: Array<any>): void {
    items.forEach((item: any): void => {
      item.expanded = this.isActive(item.route);
      if (item.children) this.expand(item.children);
    });
  }

  private isActive(instruction: any): boolean {
    return this.router.isActive(this.router.createUrlTree([instruction]), {
      paths: 'subset',
      queryParams: 'subset',
      fragment: 'ignored',
      matrixParams: 'ignored',
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
