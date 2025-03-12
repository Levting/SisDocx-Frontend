import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {User} from '../../../models/user/user';
import {UserService} from '../../../core/services/user.service';
import {environment} from '../../../../environments/environment';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../../core/services/auth.service';
import {NgClass, NgForOf, NgIf} from '@angular/common';
import {Subscription} from 'rxjs';
import {Role} from '../../../models/user/role';

@Component({
  selector: 'app-home-dashboard',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgClass,
    NgForOf
  ],
  templateUrl: './home-dashboard.component.html',
  styleUrl: './home-dashboard.component.css'
})
export class HomeDashboardComponent implements OnInit, OnDestroy {

  private subscription: Subscription | undefined;
  private formBuilder: FormBuilder = inject(FormBuilder)

  errorMessage: string = "";
  user?: User;
  userLoginOn: boolean = false;
  editMode: boolean = false;
  roles: Role[] = [];

  registerForm = this.formBuilder.group({
    firstname: ['', Validators.required],
    lastname: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    role: ['', [Validators.required]]
  })

  constructor(private userService: UserService, private authService: AuthService) {
  }

  ngOnInit(): void {
    this.subscription = this.authService.userLoginOn.subscribe({
      next: (userLoginOn) => {
        this.userLoginOn = userLoginOn;
      }
    });

    // Load roles
    this.userService.getRoles().subscribe({
      next: (rolesData: Role[]) => {
        this.roles = rolesData;
      },
      error: (error: any) => {
        console.error("Error al obtener roles:", error);
        this.errorMessage = error;
      }
    });

    // Get User and load
    this.userService.getUser(environment.userID).subscribe({
      next: (userData: User): void => {
        this.user = userData;
        this.registerForm.patchValue({
          firstname: userData.firstname,
          lastname: userData.lastname,
          email: userData.email,
          role: userData.role.id.toString()  // Asignar el ID del rol
        });
      },
      error: (error: any) => {
        console.error("Error al obtener el usuario", error);
        this.errorMessage = error;
      },
      complete: (): void => {
        console.info("User Data OK");
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  // Getters
  get firstname() {
    return this.registerForm.controls.firstname;
  }

  get lastname() {
    return this.registerForm.controls.lastname
  }

  get email() {
    return this.registerForm.controls.email
  }

  get password() {
    return this.registerForm.controls.password
  }

  get role() {
    return this.registerForm.controls.role
  }

  onSubmit(): void {
    console.log("Accion")
    if (this.registerForm.valid) {
      const updatedUser = this.registerForm.value;

      // If password is empty, do not include it
      if (!this.registerForm.value.password) {
        delete updatedUser.password; // Remove password if not modified
      }

      this.userService.updateUser(updatedUser as unknown as User).subscribe({
        next: (response) => {
          this.editMode = false;
          this.user = updatedUser as unknown as User;
          console.log("Usuario actualizado con éxito", response);
        },
        error: (error) => {
          console.error("Error al actualizar usuario", error);
          this.errorMessage = error;
        }
      });
    } else {
      console.error("Formulario no válido");
    }
  }

}
