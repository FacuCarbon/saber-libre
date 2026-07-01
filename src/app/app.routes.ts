import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { roleGuard } from './guards/role-guard';
import { guestGuard } from './guards/guest-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.page').then((m) => m.HomePage),
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
    canActivate: [authGuard, roleGuard],
    data: {
      rolesPermitidos: ['administrador', 'bibliotecario'],
    },
    children: [
      {
        path: '',
        redirectTo: 'catalogo',
        pathMatch: 'full',
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
          import('./pages/dashboard/catalogo/ejemplares/ejemplares.component').then(
            (m) => m.EjemplaresComponent,
          ),
      },
      {
        path: 'prestamos',
        loadComponent: () =>
          import('./pages/dashboard/prestamos/prestamos.page').then(
            (m) => m.PrestamosPage,
          ),
      },
      {
        path: 'prestamos/registrar',
        loadComponent: () =>
          import('./pages/dashboard/prestamos/registrar/registrar-prestamo.component').then(
            (m) => m.RegistrarPrestamoComponent,
          ),
      },
      {
        path: 'prestamos/devolver',
        loadComponent: () =>
          import('./pages/dashboard/prestamos/devolver/devolver-prestamo.component').then(
            (m) => m.DevolverPrestamoComponent,
          ),
      },
      {
        path: 'multas',
        loadComponent: () =>
          import('./pages/dashboard/multas/multas.page').then(
            (m) => m.MultasPage,
          ),
      },
      {
        path: 'alertas-mora',
        loadComponent: () =>
          import('./pages/dashboard/alertas-mora/alertas-mora.page').then(
            (m) => m.AlertasMoraPage,
          ),
      },
      {
        path: 'multas/registrar',
        loadComponent: () =>
          import('./pages/dashboard/multas/registrar/registrar-multa.component').then(
            (m) => m.RegistrarMultaComponent,
          ),
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./pages/dashboard/perfil/perfil.page').then(
            (m) => m.PerfilPage,
          ),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./pages/dashboard/usuarios/usuarios.page').then(
            (m) => m.UsuariosPage,
          ),
        canActivate: [roleGuard],
        data: {
          rolesPermitidos: ['administrador'],
        },
      },
      {
        path: 'gestion',
        loadComponent: () =>
          import('./pages/dashboard/gestion/gestion.page').then(
            (m) => m.GestionPage,
          ),
      },
    ],
  },
  {
    path: 'lector',
    loadComponent: () =>
      import('./pages/lector/lector.page').then((m) => m.LectorPage),
    canActivate: [authGuard, roleGuard],
    data: {
      rolesPermitidos: ['lector'],
    },
    children: [
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full',
      },
      {
        path: 'inicio',
        loadComponent: () =>
          import('./pages/lector/inicio/inicio.page').then(
            (m) => m.LectorInicioPage,
          ),
      },
      {
        path: 'mis-prestamos',
        loadComponent: () =>
          import('./pages/lector/mis-prestamos/mis-prestamos.page').then(
            (m) => m.MisPrestamosPage,
          ),
      },
    ],
  },
  {
    path: 'catalogo',
    loadComponent: () =>
      import('./pages/publico/catalogo/catalogo.page').then(
        (m) => m.CatalogoPage,
      ),
  },
  {
    path: 'catalogo/:id',
    loadComponent: () =>
      import('./pages/publico/detalle-libro/detalle-libro.page').then(
        (m) => m.DetalleLibroPage,
      ),
  },
  {
    path: 'demo',
    loadComponent: () =>
      import('./pages/demo/demo.page').then((m) => m.DemoPage),
    canActivate: [guestGuard],
  },
  {
    path: 'perfil',
    loadComponent: () =>
      import('./pages/home/perfil/perfil.page').then((m) => m.PerfilPage),
    canActivate: [authGuard],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
