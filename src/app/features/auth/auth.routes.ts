import { Routes } from '@angular/router';
import { AuthComponent } from './auth.component';
import { InicioSesionComponent } from './inicio-sesion/inicio-sesion.component';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: AuthComponent,
    children: [
      {
        path: 'iniciar-sesion',
        component: InicioSesionComponent,
      },
      {
        path: '',
        redirectTo: 'iniciar-sesion',
        pathMatch: 'full',
      },
    ],
  },
];
