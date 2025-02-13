import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Importa FormsModule

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  // Accion del formulario
  onSubmit() {
    console.log('Correo: ', this.email);
    console.log('Contraseña: ', this.password);

    if (this.authService.login(this.email, this.password)) {
      this.router.navigate(['/']);
    } else {
      alert('Credenciales Incorrectas');
    }
  }
}
