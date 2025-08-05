import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { LayoutComponent } from './layout/layout.component';
import { DocumentosComponent } from './features/documentos/documentos.component';

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
        path: 'revisiones',
        loadComponent: () =>
          import(
            './features/revision/revision-admin/revision-admin.component'
          ).then((m) => m.RevisionAdminComponent),
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
            './features/revision/revision-personal/revision-personal.component'
          ).then((m) => m.RevisionPersonalComponent),
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
