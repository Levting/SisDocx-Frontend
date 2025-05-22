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
        canActivate: [RoleGuard],
        data: { roles: ['Administrador'] },
      },
      {
        path: 'documentos-personal',
        component: DocumentosPersonalComponent,
        canActivate: [RoleGuard],
        data: { roles: ['Personal'] },
      },

      {
        path: 'documentos-por-aprobar',
        component: DocumentosPorAprobarComponent,
        canActivate: [RoleGuard],
        data: { roles: ['Administrador'] },
      },

      {
        path: 'papelera',
        component: PapeleraComponent,
        canActivate: [RoleGuard],
        data: { roles: ['Administrador', 'Personal'] },
      },
      {
        path: 'campana-medicion',
        component: CampanaMedicionComponent,
        canActivate: [RoleGuard],
        data: { roles: ['Administrador'] },
      },
      {
        path: 'fusion',
        component: FusionComponent,
        canActivate: [RoleGuard],
        data: { roles: ['Administrador'] },
      },
      /* {
        path: 'favoritos',
        component: FavoritosComponent,
      }, */
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
