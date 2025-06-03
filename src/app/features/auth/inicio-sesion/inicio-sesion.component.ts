import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { InicioSesionRequest } from '../../../core/models/auth/inicio-sesion-request.model';
import { ApiError } from '../../../core/models/errors/api-error.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-inicio-sesion',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, NgIf],
  templateUrl: './inicio-sesion.component.html',
})
export class InicioSesionComponent {
  public isLoading: boolean = false;
  public showPassword: boolean = false;
  private formBuilder: FormBuilder = inject(FormBuilder);

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

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

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  iniciarSesion() {
    if (this.loginForm.valid) {
      this.isLoading = true;

      this.authService
        .iniciarSesion(this.loginForm.value as InicioSesionRequest)
        .subscribe({
          next: () => {
            this.toastService.showSuccess('Inicio de sesión exitoso');
            this.router.navigate(['/']);
          },
          error: (error: ApiError) => {
            this.contrasena.setValue('');
            this.toastService.showError(error.message);
            this.isLoading = false;
          },
          complete: () => {
            this.isLoading = false;
            this.loginForm.reset();
          },
        });
    } else {
      // Si el formulario no es válido, mostramos mensaje genérico
      this.toastService.showWarning(
        'Por favor complete todos los campos correctamente'
      );
      this.loginForm.markAllAsTouched();
    }
  }
}
