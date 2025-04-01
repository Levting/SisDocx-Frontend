import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../../../models/auth/loginRequest';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, NgIf],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  public loginError: string = '';
  public isLoading: boolean = false;
  private formBuilder: FormBuilder = inject(FormBuilder);

  constructor(private router: Router, private authService: AuthService) {}

  loginForm = this.formBuilder.group({
    correo: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required]],
  });

  // Getters para los campos
  get correo() {
    return this.loginForm.controls.correo;
  }

  get contrasena() {
    return this.loginForm.controls.contrasena;
  }

  login() {
    // Limpiamos cualquier error previo
    this.loginError = '';

    if (this.loginForm.valid) {
      this.isLoading = true;

      this.authService.login(this.loginForm.value as LoginRequest).subscribe({
        next: (data) => {
          console.log('Login exitoso:', data);
        },
        error: (error) => {
          console.error('Error de login:', error);

          // Extraemos el mensaje de error exacto de la API
          if (error instanceof Error) {
            this.loginError = error.message;
          } else {
            this.loginError = 'Error desconocido durante el inicio de sesión';
          }

          this.isLoading = false;
        },
        complete: () => {
          console.info('Login Completo');
          this.isLoading = false;
          this.router.navigate(['home']);
          this.loginForm.reset();
        },
      });
    } else {
      // Si el formulario no es válido, mostramos mensaje genérico
      this.loginError = 'Por favor complete todos los campos correctamente';
      this.loginForm.markAllAsTouched();
    }
  }
}
