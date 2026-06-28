import { Injectable, inject } from '@angular/core';

import {
  Firestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
} from '@angular/fire/firestore';
import { RolUsuario, Usuario } from '../models';

@Injectable({
  providedIn: 'root',
})
export class PerfilUsuarioService {
  private _firestore = inject(Firestore);
  private nombreColeccion = 'usuarios';

  /**
   * @param usuario usuario que se registró, y lo guardamos en firestore (el id a guardar, será el uid que nos da firebase)
   */
  async crearPerfil(usuario: Usuario): Promise<void> {
    const referencia = doc(this._firestore, this.nombreColeccion, usuario.id);
    await setDoc(referencia, usuario);
  }

  /**
   *
   * @param id Identificador del usuario
   * @returns Usuario si existe, sino retorna null
   */
  async obtenerPerfil(id: string): Promise<Usuario | null> {
    const referencia = doc(this._firestore, this.nombreColeccion, id);
    const documento = await getDoc(referencia);

    if (!documento.exists()) return null;

    return documento.data() as Usuario;
  }

  /**
   *
   * @param id Identificador del usuario
   * @returns Rol del usuario si existe, sino retorna null
   */
  async obtenerRol(id: string): Promise<RolUsuario | null> {
    const perfil = await this.obtenerPerfil(id);

    if (!perfil) return null;

    return perfil.rol;
  }

  /**
   * @returns Retorna todos los perfiles de la colección usuarios
   */
  async obtenerPerfiles(): Promise<Usuario[]> {
    const referencia = collection(this._firestore, this.nombreColeccion);
    const documentos = await getDocs(referencia);

    return documentos.docs.map((documento) => documento.data() as Usuario);
  }

  /**
   * Equipo.. explico el Partial<Omit<Usuario, "id">>, porque seguramente les queden dudas..
   * Se lee de adentro hacia afuera, osea: con Omit<Usuario, "id">, le estamos diciendo:
   * agarrá el modelo Usuario, y omití el id (nos queda el Usuario sin el id).
   * Despues, con Partial, le decimos que lo que queda de esa omisión,
   * todos los campos sean opcionales. Entiendan que no es obligatorio pasar todos los campos..
   *
   */
  /**
   *
   * @param id Identificador del usuario
   * @param perfil Perfil a actualizar
   */
  async actualizarPerfil(
    id: string,
    perfil: Partial<Omit<Usuario, 'id'>>,
  ): Promise<void> {
    const referencia = doc(this._firestore, this.nombreColeccion, id);
    await updateDoc(referencia, perfil);
  }

  /**
   *
   * @param id Identificador del usuario
   */
  async eliminarPerfil(id: string): Promise<void> {
    const referencia = doc(this._firestore, this.nombreColeccion, id);
    await deleteDoc(referencia);
  }
}
