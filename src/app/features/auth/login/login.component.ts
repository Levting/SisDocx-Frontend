import {Component, inject} from '@angular/core';
import {Router} from '@angular/router';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {NgClass, NgIf} from '@angular/common';
import {AuthService} from '../../../core/services/auth.service';
import {LoginRequest} from '../../../models/auth/loginRequest';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgClass,
    NgIf
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {

  private formBuilder = inject(FormBuilder);

  constructor(private router: Router, private authService: AuthService) {
  }

  // Crear objeto formulario
  loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  })

  // Getters para los campos
  get email() {
    return this.loginForm.controls.email
  }

  get password() {
    return this.loginForm.controls.password
  }

  login() {
    if (this.loginForm.valid) {

      this.authService.login(this.loginForm.value as LoginRequest).subscribe({
        next: token => {
          console.log("Token: ", token);
        },
        error: error => {
          console.log(error);
        },
        complete: () => {
          console.info("Login Completo")
        }

      })
      this.router.navigate(['home']);
      this.loginForm.reset();
    } else {
      this.loginForm.markAllAsTouched()
    }
  }
}
