import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { LayoutComponent } from './layout/layout.component';
import { InicioComponent } from './features/inicio/inicio.component';
import { PapeleraComponent } from './features/papelera/papelera.component';
import { FavoritosComponent } from './features/favoritos/favoritos.component';
import { AjustesComponent } from './features/ajustes/ajustes.component';
import { DocumentosComponent } from './features/documentos/documentos.component';
import { CampanaMedicionComponent } from './features/campana-medicion/campana-medicion.component';
import { FusionComponent } from './features/fusion/fusion.component';
import { DocumentosPorAprobarComponent } from './features/documentos/documentos-admin/documentos-por-aprobar/documentos-por-aprobar.component';
import { DocumentosPersonalComponent } from './features/documentos/documentos-personal/documentos-personal.component';
import { DocumentosSituacionComponent } from './features/documentos-situacion/documentos-situacion.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/inicio/inicio.component').then(
            (m) => m.InicioComponent
          ),
      },
      {
        path: 'documentos',
        loadComponent: () =>
          import('./features/documentos/documentos.component').then(
            (m) => m.DocumentosComponent
          ),
        canActivate: [RoleGuard],
        data: { roles: ['Administrador'] },
      },
      {
        path: 'documentos-por-aprobar',
        loadComponent: () =>
          import(
            './features/documentos/documentos-admin/documentos-por-aprobar/documentos-por-aprobar.component'
          ).then((m) => m.DocumentosPorAprobarComponent),
        canActivate: [RoleGuard],
        data: { roles: ['Administrador'] },
      },
      {
        path: 'documentos-personal',
        loadComponent: () =>
          import(
            './features/documentos/documentos-personal/documentos-personal.component'
          ).then((m) => m.DocumentosPersonalComponent),
        canActivate: [RoleGuard],
        data: { roles: ['Personal'] },
      },
      {
        path: 'documentos-situacion',
        loadComponent: () =>
          import(
            './features/documentos-situacion/documentos-situacion.component'
          ).then((m) => m.DocumentosSituacionComponent),
        canActivate: [RoleGuard],
        data: { roles: ['Personal'] },
      },
      {
        path: 'papelera',
        loadComponent: () =>
          import('./features/papelera/papelera.component').then(
            (m) => m.PapeleraComponent
          ),
        canActivate: [RoleGuard],
        data: { roles: ['Administrador', 'Personal'] },
      },
      {
        path: 'campana-medicion',
        loadComponent: () =>
          import('./features/campana-medicion/campana-medicion.component').then(
            (m) => m.CampanaMedicionComponent
          ),
        canActivate: [RoleGuard],
        data: { roles: ['Administrador'] },
      },
      {
        path: 'fusion',
        loadComponent: () =>
          import('./features/fusion/fusion.component').then(
            (m) => m.FusionComponent
          ),
        canActivate: [RoleGuard],
        data: { roles: ['Administrador'] },
      },
      /* {
        path: 'favoritos',
        component: FavoritosComponent,
      }, */
      {
        path: 'ajustes',
        loadComponent: () =>
          import('./features/ajustes/ajustes.component').then(
            (m) => m.AjustesComponent
          ),
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
