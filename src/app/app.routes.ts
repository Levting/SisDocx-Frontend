import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth-guard.guard';
import { LayoutComponent } from './shared/layout/layout.component';
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
