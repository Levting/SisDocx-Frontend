import {Routes} from '@angular/router';
import {LoginComponent} from './features/auth/login/login.component';
import {LayoutComponent} from './shared/layout/layout.component';
import {AuthComponent} from './features/auth/auth.component';
import {AuthGuard} from './core/guards/auth-guard.guard';
import {HomeComponent} from './features/home/home.component';
import {DocumentComponent} from './features/document/document.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard], // Protege las rutas
    children: [
      {
        path: 'home',
        component: HomeComponent
      },
      {
        path: 'document',
        component: DocumentComponent
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
    ],
  },

  {
    path: 'login',
    component: AuthComponent,
    children: [
      {
        path: '',
        component: LoginComponent,
      },
    ],
  },

  {
    path: '',
    redirectTo: '/',
    pathMatch: 'full',
  },
];
