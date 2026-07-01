import { Injectable, inject } from '@angular/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import { Capacitor } from '@capacitor/core';

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
  signInWithCredential,
} from '@angular/fire/auth';
import { PerfilUsuarioService } from './perfil-usuario.service';
import { RolUsuario, Usuario } from '../models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _auth = inject(Auth);
  private _perfilUsuarioService = inject(PerfilUsuarioService);
  private _perfilActual: Usuario | null = null;
  private _uidPerfilActual: string | null = null;
  private _cargaPerfilActual: Promise<Usuario | null> | null = null;

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

  async logout(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await FirebaseAuthentication.signOut();
    }

    await signOut(this._auth);
    this.limpiarPerfilActual();
  }

  async usuarioActual(): Promise<Usuario | null> {
    await this._auth.authStateReady();
    const usuario = this._auth.currentUser;
    if (!usuario) {
      this.limpiarPerfilActual();
      return null;
    }

    if (this._uidPerfilActual === usuario.uid && this._perfilActual) {
      return this._perfilActual;
    }

    if (this._uidPerfilActual === usuario.uid && this._cargaPerfilActual) {
      return this._cargaPerfilActual;
    }

    this._uidPerfilActual = usuario.uid;
    const cargaPerfil = this.cargarPerfilConReintentos(usuario.uid);
    this._cargaPerfilActual = cargaPerfil;

    try {
      const perfil = await cargaPerfil;
      if (this._auth.currentUser?.uid === usuario.uid && perfil) {
        this._perfilActual = perfil;
      }
      return perfil;
    } finally {
      if (this._cargaPerfilActual === cargaPerfil) {
        this._cargaPerfilActual = null;
      }
    }
  }

  async rolUsuarioActual(): Promise<RolUsuario | null> {
    const perfil = await this.usuarioActual();
    return perfil?.rol ?? null;
  }

  async iniciarSesionGoogle(): Promise<void> {
    const usuario = Capacitor.isNativePlatform()
      ? await this.iniciarSesionGoogleNativo()
      : await this.iniciarSesionGoogleWeb();

    if (!usuario.email) {
      await this.logout();
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
      this.guardarPerfilActual(nuevoUsuario);
    } else {
      this.guardarPerfilActual(perfil);
    }
  }

  private async iniciarSesionGoogleWeb(): Promise<User> {
    const provider = new GoogleAuthProvider();
    const credenciales = await signInWithPopup(this._auth, provider);
    return credenciales.user;
  }

  private async iniciarSesionGoogleNativo(): Promise<User> {
    try {
      const resultado = await FirebaseAuthentication.signInWithGoogle();
      const idToken = resultado.credential?.idToken;

      if (!idToken) {
        throw new Error('Google no devolvió una credencial válida.');
      }

      const credencial = GoogleAuthProvider.credential(idToken);
      const credencialesWeb = await signInWithCredential(
        this._auth,
        credencial,
      );

      return credencialesWeb.user;
    } catch (error) {
      await FirebaseAuthentication.signOut().catch(() => undefined);
      await signOut(this._auth).catch(() => undefined);
      throw error;
    }
  }

  async obtenerUsuarios(): Promise<Usuario[]> {
    return this._perfilUsuarioService.obtenerPerfiles();
  }

  private async cargarPerfilConReintentos(
    uid: string,
  ): Promise<Usuario | null> {
    const cantidadIntentos = 4;

    for (let intento = 0; intento < cantidadIntentos; intento++) {
      const perfil = await this._perfilUsuarioService.obtenerPerfil(uid);
      if (perfil) {
        return perfil;
      }

      if (intento < cantidadIntentos - 1) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    return null;
  }

  private guardarPerfilActual(perfil: Usuario): void {
    this._uidPerfilActual = perfil.id;
    this._perfilActual = perfil;
  }

  private limpiarPerfilActual(): void {
    this._uidPerfilActual = null;
    this._perfilActual = null;
    this._cargaPerfilActual = null;
  }
}
