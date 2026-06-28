import { inject } from '@angular/core';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { Router } from '@angular/router';

export const authGuard = async () => {
  const auth = inject(Auth);
  const router = inject(Router);

  const usuario = await new Promise<User | null>((resolve) => {
    const unsub = onAuthStateChanged(auth, (user: User | null) => {
      unsub();
      resolve(user);
    });
  });

  if (usuario && usuario.emailVerified) {
    return true;
  } else {
    alert('Debes iniciar sesión para acceder a esta página.');
    return router.createUrlTree(['/demo']);
  }
};
