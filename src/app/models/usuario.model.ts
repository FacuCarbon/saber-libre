export type RolUsuario = 'administrador' | 'bibliotecario' | 'lector';

export interface Usuario {
  id: string;
  nombreCompleto: string;
  email: string;
  telefono?: string;
  rol: RolUsuario;
}
