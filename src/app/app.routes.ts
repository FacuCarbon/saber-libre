import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';
import { guestGuard } from './guards/guest-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./pages/auth/login/login.page').then((m) => m.LoginPage),
    canActivate: [guestGuard],
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./pages/auth/register/register.page').then((m) => m.RegisterPage),
    canActivate: [guestGuard],
  },

  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard/dashboard.page').then(
        (m) => m.DashboardPage,
      ),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full',
      },
      {
        path: 'inicio',
        loadComponent: () =>
          import('./pages/dashboard/inicio/inicio.page').then(
            (m) => m.InicioPage,
          ),
      },
      {
        path: 'catalogo',
        loadComponent: () =>
          import('./pages/dashboard/catalogo/catalogo.page').then(
            (m) => m.CatalogoPage,
          ),
      },
      {
        path: 'catalogo/agregar',
        loadComponent: () =>
          import('./pages/dashboard/catalogo/agregar/agregar.component').then(
            (m) => m.AgregarComponent,
          ),
      },
      {
        path: 'catalogo/detalle/:id',
        loadComponent: () =>
          import('./pages/dashboard/catalogo/detalle/detalle.component').then(
            (m) => m.DetalleComponent,
          ),
      },
      {
        path: 'catalogo/editar/:id',
        loadComponent: () =>
          import('./pages/dashboard/catalogo/editar/editar.component').then(
            (m) => m.EditarComponent,
          ),
      },
      {
        path: 'catalogo/:id/ejemplares',
        loadComponent: () =>
          import(
            './pages/dashboard/catalogo/ejemplares/ejemplares.component'
          ).then((m) => m.EjemplaresComponent),
      },
      {
        path: 'prestamos',
        loadComponent: () =>
          import('./pages/dashboard/prestamos/prestamos.page').then(
            (m) => m.PrestamosPage,
          ),
        canActivate: [roleGuard],
        data: {
          rolesPermitidos: ['administrador', 'bibliotecario', 'lector'],
        },
      },
      {
        path: 'multas',
        loadComponent: () =>
          import('./pages/dashboard/multas/multas.page').then(
            (m) => m.MultasPage,
          ),
        canActivate: [roleGuard],
        data: {
          rolesPermitidos: ['administrador', 'bibliotecario'],
        },
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./pages/dashboard/perfil/perfil.page').then(
            (m) => m.PerfilPage,
          ),
      },
      {
        path: 'gestion',
        loadComponent: () =>
          import('./pages/dashboard/gestion/gestion.page').then(
            (m) => m.GestionPage,
          ),
        canActivate: [roleGuard],
        data: {
          rolesPermitidos: ['administrador', 'bibliotecario'],
        },
      },
    ],
  },
  {
    path: 'demo',
    loadComponent: () =>
      import('./pages/demo/demo.page').then((m) => m.DemoPage),
    canActivate: [guestGuard],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
