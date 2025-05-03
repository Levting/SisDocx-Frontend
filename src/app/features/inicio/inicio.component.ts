import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Usuario } from  '../../core/models/usuario/usuario.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [],
  templateUrl: './inicio.component.html',
})
export class InicioComponent implements OnInit, OnDestroy {
  public mensajeBienvenida: string = '';
  public usuario: Usuario | null = null;
  private usuarioSubscription?: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Obtener el mensaje de bienvenida
    this.mensajeBienvenida = this.obtenerMensajeBienvenida();

    // Obtener el usaurio autenticado suscribiendose a los cambios del servicio de autenticacion
    this.usuarioSubscription = this.authService.usuario.subscribe((usuario) => {
      this.usuario = usuario;
    });
  }

  /**
   * Destruye la suscripción al usuario
   */
  ngOnDestroy(): void {
    if (this.usuarioSubscription) {
      this.usuarioSubscription.unsubscribe();
    }
  }

  /**
   * Obtiene el mensaje de bienvenida según la hora del día
   * @returns Mensaje de bienvenida
   */
  obtenerMensajeBienvenida(): string {
    const hora = new Date().getHours();

    if (hora >= 5 && hora < 12) {
      return 'Buenos Días';
    } else if (hora >= 12 && hora < 18) {
      return 'Buenas Tardes';
    } else {
      return 'Buenas Noches';
    }
  }
}
