import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { environment } from '../../../../environments/environment';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { Subscription } from 'rxjs';
import { Rol } from '../../../core/models/usuario/rol';
import { Usuario } from '../../../core/models/usuario/usuario';

@Component({
  selector: 'app-home-dashboard',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgClass, NgForOf],
  templateUrl: './home-dashboard.component.html',
  styleUrl: './home-dashboard.component.css',
})
export class HomeDashboardComponent implements OnInit, OnDestroy {
  private subscription: Subscription | undefined;
  private formBuilder: FormBuilder = inject(FormBuilder);

  errorMessage: string = '';
  usuario?: Usuario;
  userLoginOn: boolean = false;
  editMode: boolean = false;
  roles: Rol[] = [];

  registerForm = this.formBuilder.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    contrasena: [''],
    rol: ['', [Validators.required]],
  });

  constructor(
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.subscription = this.authService.userLoginOn.subscribe({
      next: (userLoginOn) => {
        this.userLoginOn = userLoginOn;
      },
    });

    // Load roles
    this.userService.getRoles().subscribe({
      next: (rolesData: Rol[]) => {
        this.roles = rolesData;
      },
      error: (error: any) => {
        console.error('Error al obtener roles:', error);
        this.errorMessage = error;
      },
    });

    // Get User and load
    this.userService.getUser(environment.userID).subscribe({
      next: (userData: Usuario): void => {
        this.usuario = userData;
        this.registerForm.patchValue({
          nombre: userData.nombre,
          apellido: userData.apellido,
          correo: userData.correo,
          rol: userData.rol?.id ? userData.rol.id.toString() : '',
        });
      },
      error: (error: any) => {
        console.error('Error al obtener el usuario', error);
        this.errorMessage = error;
      },
      complete: (): void => {
        console.info('User Data OK');
      },
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  // Getters
  get nombre() {
    return this.registerForm.controls.nombre;
  }

  get apellido() {
    return this.registerForm.controls.apellido;
  }

  get correo() {
    return this.registerForm.controls.correo;
  }

  get contrasena() {
    return this.registerForm.controls.contrasena;
  }

  get rol() {
    return this.registerForm.controls.rol;
  }

  onSubmit(): void {
    console.log('Accion');
    if (this.registerForm.valid) {
      const updatedUser = this.registerForm.value;

      // If password is empty, do not include it
      if (!this.registerForm.value.contrasena) {
        delete updatedUser.contrasena; // Remove password if not modified
      }

      this.userService.updateUser(updatedUser as unknown as Usuario).subscribe({
        next: (response) => {
          this.editMode = false;
          this.usuario = updatedUser as unknown as Usuario;
          console.log('Usuario actualizado con éxito', response);
        },
        error: (error) => {
          console.error('Error al actualizar usuario', error);
          this.errorMessage = error;
        },
      });
    } else {
      console.error('Formulario no válido');
    }
  }
}
