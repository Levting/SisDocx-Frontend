import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {NgIf} from '@angular/common';
import {RouterLink} from '@angular/router';
import {AuthService} from '../../../../core/services/auth.service';

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

  // Llamar al servicio
  ngOnInit(): void {
    this.authService.currentUserLoginOn.subscribe({
      next: userLoginOn => {
        this.userLoginOn = userLoginOn;
      }
    })
  }

  ngOnDestroy(): void {
    this.authService.currentUserLoginOn.unsubscribe();
  }

}
