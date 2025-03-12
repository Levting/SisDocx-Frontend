import {Component, OnDestroy, OnInit} from '@angular/core';
import {NgClass, NgIf, NgOptimizedImage} from '@angular/common';
import {MenuService} from '../../../../core/services/menu.service';
import {AuthService} from '../../../../core/services/auth.service';
import {User} from '../../../../models/user/user';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    NgClass,
    NgIf
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit, OnDestroy {

  userLoginOn: boolean = false;
  private subscription: Subscription | undefined;

  constructor(protected menuService: MenuService, private authService: AuthService) {
  }

  ngOnInit(): void {
    this.subscription = this.authService.userLoginOn.subscribe({
      next: userLoginOn => {
        this.userLoginOn = userLoginOn;
      }
    });
  }

  public toggleSidebar() {
    this.menuService.toggleSidebar()
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
