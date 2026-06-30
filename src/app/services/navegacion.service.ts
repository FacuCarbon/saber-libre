import { Injectable } from '@angular/core';
import { RolUsuario } from '../models';

export interface NavItem {
  title: string;
  url: string;
  icon: string;
  mobile?: 'tab' | 'more';
  exact?: boolean;
  rolesPermitidos?: RolUsuario[];
}

@Injectable({ providedIn: 'root' })
export class NavegacionService {
  public dashboardMenu: NavItem[] = [
    {
      title: 'Inicio',
      url: '/dashboard/inicio',
      icon: 'home-outline',
      mobile: 'tab',
      exact: true,
    },
    {
      title: 'Catalogo',
      url: '/dashboard/catalogo',
      icon: 'library-outline',
      mobile: 'tab',
      exact: false,
    },
    {
      title: 'Prestamos',
      url: '/dashboard/prestamos',
      icon: 'swap-horizontal',
      mobile: 'tab',
      exact: false,
    },
    {
      title: 'Multas',
      url: '/dashboard/multas',
      icon: 'receipt-outline',
      mobile: 'more',
      exact: true,
      rolesPermitidos: ['administrador', 'bibliotecario'],
    },
    {
      title: 'Gestion',
      url: '/dashboard/gestion',
      icon: 'construct-outline',
      mobile: 'tab',
      exact: true,
      rolesPermitidos: ['administrador', 'bibliotecario'],
    },
    {
      title: 'Mi perfil',
      url: '/dashboard/perfil',
      icon: 'person-circle-outline',
      mobile: 'more',
      exact: true,
    },
  ];

  public homeMenu: NavItem[] = [
    { title: 'Login', url: '/auth/login', icon: 'log-in', exact: true },
  ];

  constructor() {}
}
