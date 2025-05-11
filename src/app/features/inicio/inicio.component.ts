import { Component, OnDestroy, OnInit } from '@angular/core';
import { Usuario } from '../../core/models/usuario/usuario.model';
import { Subscription } from 'rxjs';
import { UserService } from '../../core/services/user.service';
import { RoleService } from '../../core/services/role.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [],
  templateUrl: './inicio.component.html',
})
export class InicioComponent implements OnInit, OnDestroy {
  public mensajeBienvenida: string = '';
  public rol: string = '';
  public provincia: string = '';
  public usuario: Usuario | null = null;
  private usuarioSubscription?: Subscription;

  constructor(
    private userService: UserService,
    private roleService: RoleService
  ) {}

  ngOnInit(): void {
    // Suscribirse a los cambios del usuario
    this.userService.usuarioAutenticado$.subscribe((usuario) => {
      this.usuario = usuario;
      this.rol = this.roleService.getUserRole();
      this.provincia = this.roleService.getUserProvince();
      this.actualizarMensajeBienvenida();
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

  private actualizarMensajeBienvenida(): void {
    const hora = new Date().getHours();
    let saludo = '';

    if (hora >= 5 && hora < 12) {
      saludo = 'Buenos Días';
    } else if (hora >= 12 && hora < 18) {
      saludo = 'Buenas Tardes';
    } else {
      saludo = 'Buenas Noches';
    }
    this.mensajeBienvenida = `${saludo}`;

  }
}
