import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (_route, _state) => {
  const router = inject(Router);

  const token = localStorage.getItem('token');

  if (!token) {
    // Esto es temporal, hasta que haga el servicio del storage.. está así para poder entrar a las rutas protegidas.
    return true;
  } else {
    return router.parseUrl('auth/login');
  }
};
