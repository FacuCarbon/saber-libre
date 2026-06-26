import { Injectable, inject } from '@angular/core';

import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  type User,
  sendEmailVerification,
  reload,
} from '@angular/fire/auth';
import { PerfilUsuarioService } from './perfil-usuario.service';
import { RolUsuario, Usuario } from '../models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _auth = inject(Auth);
  private _perfilUsuarioService = inject(PerfilUsuarioService);

  /**
   * @param email Email del usuario
   * @param password Password del usuario
   * @param nombreCompleto Nombre completo del usuario
   */
  async registrar(
    email: string,
    password: string,
    nombreCompleto: string,
  ): Promise<void> {
    try {
      const datosUsuario = await createUserWithEmailAndPassword(
        this._auth,
        email,
        password,
      );

      const nuevoUsuario: Usuario = {
        id: datosUsuario.user.uid,
        nombreCompleto: nombreCompleto,
        email: datosUsuario.user.email || email,
        rol: 'lector',
      };

      await this._perfilUsuarioService.crearPerfil(nuevoUsuario);
      await sendEmailVerification(datosUsuario.user);

      await signOut(this._auth);
    } catch (error) {
      console.log(`Error al registrar al usuario: ${error}`);
      throw error;
    }
  }

  /**
   * @param email Email del usuario
   * @param password Password del usuario
   * @returns Usuario que inició sesión.
   */
  async iniciarSesion(email: string, password: string): Promise<User> {
    const credenciales = await signInWithEmailAndPassword(
      this._auth,
      email,
      password,
    );

    await reload(credenciales.user);

    if (!credenciales.user.emailVerified) {
      await signOut(this._auth);
      throw new Error('Email no verificado.');
    }

    return credenciales.user;
  }

  logout(): Promise<void> {
    return signOut(this._auth);
  }

  async usuarioActual(): Promise<Usuario | null> {
    const usuario = this._auth.currentUser;
    if (!usuario) {
      return null;
    }
    return this._perfilUsuarioService.obtenerPerfil(usuario.uid);
  }

  async rolUsuarioActual(): Promise<RolUsuario | null> {
    const usuario = this._auth.currentUser;
    if (!usuario) {
      return null;
    }
    return this._perfilUsuarioService.obtenerRol(usuario.uid);
  }

  async iniciarSesionGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    const credenciales = await signInWithPopup(this._auth, provider);
    const usuario = credenciales.user;
    if (!usuario.email) {
      await signOut(this._auth);
      throw new Error('El email de Google no está disponible.');
    }

    const perfil = await this._perfilUsuarioService.obtenerPerfil(usuario.uid);
    if (!perfil) {
      const nuevoUsuario: Usuario = {
        id: usuario.uid,
        nombreCompleto: usuario.displayName || '',
        email: usuario.email,
        rol: 'lector',
      };

      await this._perfilUsuarioService.crearPerfil(nuevoUsuario);
    }
  }
}
