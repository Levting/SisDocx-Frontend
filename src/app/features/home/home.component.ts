import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {NgIf} from '@angular/common';
import {AuthService} from '../../core/services/auth.service';
import {HomeDashboardComponent} from './home-dashboard/home-dashboard.component';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgIf, HomeDashboardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit, OnDestroy {

  userLoginOn: boolean = false;
  private authService = inject(AuthService);
  private subscription: Subscription | undefined;

  ngOnInit() {
    this.subscription = this.authService.userLoginOn.subscribe({
      next: (userLoginOn) => {
        this.userLoginOn = userLoginOn;
      },
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
