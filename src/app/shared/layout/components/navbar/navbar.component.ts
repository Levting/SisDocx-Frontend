import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {NgIf} from '@angular/common';
import {RouterLink} from '@angular/router';
import {AuthService} from '../../../../core/services/auth.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    NgIf,
    RouterLink
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {

  userLoginOn: boolean = false;
  private authService = inject(AuthService);
  private subscription: Subscription | undefined;

  ngOnInit(): void {
    this.subscription = this.authService.userLoginOn.subscribe({
      next: userLoginOn => {
        this.userLoginOn = userLoginOn;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
