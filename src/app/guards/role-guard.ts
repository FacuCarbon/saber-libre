import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { RolUsuario } from '../models';

import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = async (route, _state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const rolUsuario = await authService.rolUsuarioActual();

  const rolesPermitidos: RolUsuario[] = route.data['rolesPermitidos'];

  if (
    rolesPermitidos &&
    rolUsuario &&
    rolesPermitidos.includes(rolUsuario as RolUsuario)
  ) {
    return true;
  } else {
    alert('No tenes permisos para entrar acá.');
    return router.parseUrl('/dashboard');
  }
};
