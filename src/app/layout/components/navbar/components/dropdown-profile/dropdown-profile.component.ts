import {
  Component,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../../core/services/auth.service';
import { Usuario } from '../../../../../core/models/usuario/usuario.model';
import { UserService } from '../../../../../core/services/user.service';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';
import { SvgIconComponent } from 'angular-svg-icon';

@Component({
  selector: 'app-dropdown-profile',
  standalone: true,
  imports: [NgIf, SvgIconComponent, RouterLink, RouterLinkActive],
  templateUrl: './dropdown-profile.component.html',
  animations: [
    trigger('slideInOut', [
      state(
        'void',
        style({
          transform: 'translateY(-10px)',
          opacity: 0,
        })
      ),
      state(
        '*',
        style({
          transform: 'translateY(0)',
          opacity: 1,
        })
      ),
      transition('void <=> *', [animate('150ms ease-out')]),
    ]),
  ],
})
export class DropdownProfileComponent implements OnInit, OnDestroy {
  public usuario: Usuario | null = null;
  public userLoginOn: boolean = false;
  public mostrarMenu: boolean = false;

  private elementRef = inject(ElementRef);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);

  private destroy$ = new Subject<void>();

  ngOnInit() {
    // Suscripción al observable 'usuario' del servicio de autenticación para actualizar el perfil del usuario.
    this.userService.usuarioAutenticado$
      .pipe(takeUntil(this.destroy$))
      .subscribe((usuario) => (this.usuario = usuario));

    // Suscripción al observable 'userLoginOn' del servicio de autenticación que indica si el usuario está logueado.
    this.authService.userLoginOn
      .pipe(takeUntil(this.destroy$))
      .subscribe((loginOn) => (this.userLoginOn = loginOn));
  }

  // Limpia las suscripciones al Subject 'destroy$', asegurando que no haya fugas de memoria.

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Método que alterna la visibilidad del menú desplegable.
  toggleMenu() {
    this.mostrarMenu = !this.mostrarMenu;
  }

  // Detecta clics fuera del componente para cerrar el menú cuando el usuario haga clic en cualquier parte fuera del menú.
  @HostListener('document:click', ['$event.target'])
  onClickOutside(target: HTMLElement) {
    const clickedInside = this.elementRef.nativeElement.contains(target);
    if (!clickedInside && this.mostrarMenu) {
      this.mostrarMenu = false;
    }
  }
  // Método para cerrar sesión y redirigir al usuario a la página de inicio de sesión.
  cerrarSesion() {
    this.authService.cerrarSesion();
    this.router.navigate(['auth/iniciar-sesion']);
  }
}
