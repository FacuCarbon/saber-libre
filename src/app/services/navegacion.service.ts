import { Injectable } from '@angular/core';

export interface NavItem {
  title: string;
  url: string;
  icon: string;
}

@Injectable({ providedIn: 'root' })
export class NavegacionService {
  public dashboardMenu: NavItem[] = [
    { title: 'Inicio', url: '/dashboard/inicio', icon: 'home-outline' },
    { title: 'Catalogo', url: '/dashboard/catalogo', icon: 'library-outline' },
    {
      title: 'Gestion',
      url: '/dashboard/gestion',
      icon: 'construct-outline',
    },
    {
      title: 'Prestamos',
      url: '/dashboard/prestamos',
      icon: 'swap-horizontal',
    },
    { title: 'Multas', url: '/dashboard/multas', icon: 'receipt-outline' },
    {
      title: 'Mi perfil',
      url: '/dashboard/perfil',
      icon: 'person-circle-outline',
    },
  ];

  public homeMenu: NavItem[] = [
    { title: 'Login', url: '/auth/login', icon: 'log-in' },
  ];

  constructor() {}
}
