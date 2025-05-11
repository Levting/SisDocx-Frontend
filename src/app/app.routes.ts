import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { LayoutComponent } from './layout/layout.component';
import { InicioComponent } from './features/inicio/inicio.component';
import { PapeleraComponent } from './features/papelera/papelera.component';
import { FavoritosComponent } from './features/favoritos/favoritos.component';
import { AjustesComponent } from './features/ajustes/ajustes.component';
import { DocumentosComponent } from './features/documentos/documentos.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: InicioComponent,
      },
      {
        path: 'documentos',
        component: DocumentosComponent,
      },
      {
        path: 'documentos-por-aprobar',
        component: DocumentosComponent,
        canActivate: [RoleGuard],
        data: { roles: ['Administrador'] },
      },
      {
        path: 'papelera',
        component: PapeleraComponent,
      },
      {
        path: 'favoritos',
        component: FavoritosComponent,
      },
      {
        path: 'ajustes',
        component: AjustesComponent,
        canActivate: [RoleGuard],
        data: { roles: ['Administrador'] },
      },
      {
        path: 'campana-medicion',
        component: DocumentosComponent,
        canActivate: [RoleGuard],
        data: { roles: ['Administrador'] },
      },
      {
        path: 'fusion',
        component: DocumentosComponent,
        canActivate: [RoleGuard],
        data: { roles: ['Administrador'] },
      },
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '**',
    redirectTo: 'inicio',
  },
];
