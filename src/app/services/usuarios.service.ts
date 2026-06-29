import { Injectable } from '@angular/core';

import { Usuario } from '../models/usuario.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  constructor(private _storageService: StorageService) {}

  // Devuelve todos los usuarios.
  async obtenerUsuarios(): Promise<Usuario[]> {
    return this._storageService.obtenerLista<Usuario>('usuarios');
  }

  // Busca un usuario por su id. Si no existe, devuelve null.
  async obtenerUsuarioPorId(id: string): Promise<Usuario | null> {
    return this._storageService.obtenerPorId<Usuario>('usuarios', id);
  }

  // Filtra usuarios por nombre, email o rol.
  // Si se pasa rolFiltro, solo muestra los que tengan ese rol.
  async buscarUsuarios(
    query: string,
    rolFiltro?: string,
  ): Promise<Usuario[]> {
    const todos = await this.obtenerUsuarios();
    const textoBuscado = query.toLowerCase().trim();

    return todos.filter((usuario) => {
      // Si hay filtro de rol, saltea los que no coinciden
      if (rolFiltro && usuario.rol !== rolFiltro) {
        return false;
      }

      // Si no hay texto, muestra todos los que pasaron el filtro de rol
      if (textoBuscado === '') {
        return true;
      }

      // Busca el texto en nombre, email o rol
      const nombreCoincide = usuario.nombreCompleto.toLowerCase().includes(textoBuscado);
      const emailCoincide = usuario.email.toLowerCase().includes(textoBuscado);
      const rolCoincide = usuario.rol.toLowerCase().includes(textoBuscado);

      return nombreCoincide || emailCoincide || rolCoincide;
    });
  }

  // Crea un nuevo usuario. El id se genera automaticamente con la fecha actual.
  async crearUsuario(usuario: Usuario): Promise<boolean> {
    const nuevoUsuario = {
      id: Date.now().toString(),
      nombreCompleto: usuario.nombreCompleto,
      email: usuario.email,
      telefono: usuario.telefono,
      rol: usuario.rol,
    };

    return this._storageService.guardar<Usuario>('usuarios', nuevoUsuario);
  }

  // Actualiza los datos de un usuario. El usuario debe tener un id valido.
  async actualizarUsuario(usuario: Usuario): Promise<boolean> {
    return this._storageService.actualizar<Usuario>('usuarios', usuario);
  }

  // Verifica si un texto es uno de los roles permitidos.
  esRolValido(rol: string): boolean {
    const roles = ['administrador', 'bibliotecario', 'lector'];
    return roles.includes(rol);
  }

  // RF07: solo el administrador puede ver el telefono.
  // Si el rol no es administrador, devuelve el usuario sin telefono.
  ocultarTelefono(usuario: Usuario, rolSolicitante: string): Usuario {
    if (rolSolicitante !== 'administrador') {
      return {
        id: usuario.id,
        nombreCompleto: usuario.nombreCompleto,
        email: usuario.email,
        rol: usuario.rol,
      };
    }
    return usuario;
  }

  // Aplica ocultarTelefono a una lista entera de usuarios.
  ocultarTelefonoEnLista(
    usuarios: Usuario[],
    rolSolicitante: string,
  ): Usuario[] {
    const resultado: Usuario[] = [];

    for (let i = 0; i < usuarios.length; i++) {
      const usuarioOculto = this.ocultarTelefono(usuarios[i], rolSolicitante);
      resultado.push(usuarioOculto);
    }

    return resultado;
  }
}
