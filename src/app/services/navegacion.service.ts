import { Injectable } from '@angular/core';

export interface NavItem {
  title: string;
  url: string;
  icon: string;
  mobile?: 'tab' | 'more';
}

@Injectable({ providedIn: 'root' })
export class NavegacionService {
  public dashboardMenu: NavItem[] = [
    {
      title: 'Inicio',
      url: '/dashboard/inicio',
      icon: 'home-outline',
      mobile: 'tab',
    },
    {
      title: 'Catalogo',
      url: '/dashboard/catalogo',
      icon: 'library-outline',
      mobile: 'tab',
    },
    {
      title: 'Usuarios',
      url: '/dashboard/usuarios',
      icon: 'people-outline',
      mobile: 'more',
    },
    {
      title: 'Prestamos',
      url: '/dashboard/prestamos',
      icon: 'swap-horizontal',
      mobile: 'tab',
    },
    {
      title: 'Multas',
      url: '/dashboard/multas',
      icon: 'receipt-outline',
      mobile: 'more',
    },
    {
      title: 'Gestion',
      url: '/dashboard/gestion',
      icon: 'construct-outline',
      mobile: 'tab',
    },
    {
      title: 'Mi perfil',
      url: '/dashboard/perfil',
      icon: 'person-circle-outline',
      mobile: 'more',
    },
  ];

  public homeMenu: NavItem[] = [
    { title: 'Login', url: '/auth/login', icon: 'log-in' },
  ];

  constructor() {}
}
