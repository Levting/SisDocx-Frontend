import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {NgIf} from '@angular/common';
import {AuthService} from '../../core/services/auth.service';
import {User} from '../../models/user/user';
import {HomeDashboardComponent} from './home-dashboard/home-dashboard.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NgIf,
    HomeDashboardComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy{

  userLoginOn: boolean = false;
  userData?: User
  private authService = inject(AuthService);

  ngOnInit() {
    this.authService.currentUserLoginOn.subscribe({
      next: userLoginOn => {
        this.userLoginOn = userLoginOn;
      }
    });

    this.authService.currentUserData.subscribe({
      next: data => {
        this.userData = data;
      }
    })

  }

  ngOnDestroy(): void {
    this.authService.currentUserData.unsubscribe();
    this.authService.currentUserLoginOn.unsubscribe();
  }

}
