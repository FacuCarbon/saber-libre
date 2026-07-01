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
      url: '/',
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
      title: 'Préstamos',
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
      exact: false,
      rolesPermitidos: ['administrador', 'bibliotecario'],
    },
    {
      title: 'Alertas de mora',
      url: '/dashboard/alertas-mora',
      icon: 'notifications-outline',
      mobile: 'more',
      exact: true,
      rolesPermitidos: ['administrador', 'bibliotecario'],
    },

    {
      title: 'Usuarios',
      url: '/dashboard/usuarios',
      icon: 'people-outline',
      mobile: 'more',
      exact: false,
      rolesPermitidos: ['administrador'],
    },

    {
      title: 'Mi perfil',
      url: '/dashboard/perfil',
      icon: 'person-circle-outline',
      mobile: 'more',
      exact: true,
    },
    {
      title: 'Configuración',
      url: '/dashboard/gestion',
      icon: 'settings-outline',
      mobile: 'more',
      exact: true,
      rolesPermitidos: ['administrador', 'bibliotecario'],
    },
  ];

  public lectorMenu: NavItem[] = [
    {
      title: 'Inicio',
      url: '/lector/inicio',
      icon: 'home-outline',
      mobile: 'tab',
      exact: true,
    },
    {
      title: 'Catálogo',
      url: '/catalogo',
      icon: 'library-outline',
      mobile: 'tab',
      exact: false,
    },
    {
      title: 'Mis Préstamos',
      url: '/lector/mis-prestamos',
      icon: 'swap-horizontal',
      mobile: 'tab',
      exact: false,
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
