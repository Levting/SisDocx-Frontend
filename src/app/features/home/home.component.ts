import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { HomeDashboardComponent } from './home-dashboard/home-dashboard.component';

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

  ngOnInit() {
    this.authService.currentUserLoginOn.subscribe({
      next: (userLoginOn) => {
        this.userLoginOn = userLoginOn;
      },
    });
  }

  ngOnDestroy(): void {
    this.authService.currentTokenData.unsubscribe();
    this.authService.currentUserLoginOn.unsubscribe();
  }
}
