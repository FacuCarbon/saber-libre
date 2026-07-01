import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { RolUsuario } from '../models';

import { AuthService } from '../services/auth.service';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';

export const roleGuard: CanActivateFn = async (route, _state) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const authService = inject(AuthService);

  const usuario = await new Promise<User | null>((resolve) => {
    const unsub = onAuthStateChanged(auth, (user: User | null) => {
      unsub();
      resolve(user);
    });
  });

  if (!usuario) {
    return router.parseUrl('/');
  }

  const rolUsuario = await authService.rolUsuarioActual();

  const rolesPermitidos: RolUsuario[] = route.data['rolesPermitidos'];

  if (
    rolesPermitidos &&
    rolUsuario &&
    rolesPermitidos.includes(rolUsuario as RolUsuario)
  ) {
    return true;
  } else {
    
    return router.parseUrl('/');
  }
};
