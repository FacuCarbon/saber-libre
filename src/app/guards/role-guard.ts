import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { RolUsuario } from '../models';

export const roleGuard: CanActivateFn = (route, _state) => {
  const router = inject(Router);

  const rolUsuario = localStorage.getItem('role');

  const rolesPermitidos: RolUsuario[] = route.data['rolesPermitidos'];

  if (
    rolesPermitidos &&
    rolUsuario &&
    rolesPermitidos.includes(rolUsuario as RolUsuario)
  ) {
    return true;
  } else {
    alert('No tenes permisos para entrar acá.');
    return router.parseUrl('/dashboard/catalogo');
  }
};
