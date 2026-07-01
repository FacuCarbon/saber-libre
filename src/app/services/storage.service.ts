import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
export type StorageKey =
  | 'usuarios'
  | 'libros'
  | 'ejemplares'
  | 'prestamos'
  | 'multas'
  | 'alertasMora';

export const EXPORTABLE_STORAGE_KEYS = [
  'libros',
  'ejemplares',
  'prestamos',
  'multas',
  'alertasMora',
] as const;

export type ExportableStorageKey = (typeof EXPORTABLE_STORAGE_KEYS)[number];

interface WithId {
  id: string;
}

/*
EQUIPO, LEER ANTES DE USAR ESTE SERVICIO:

1. <T>: Es nuestro 'comodín'. Le dice a TypeScript que este servicio es flexible y funciona con cualquier tipo de dato (libros, préstamos, etc.) que nosotros le pasemos.

2. ¿Para qué usamos `extends WithId`? Es nuestro 'contrato'. Garantiza que cualquier objeto que queramos eliminar o  actualizar tenga obligatoriamente una propiedad llamada 'id'. Esto evita errores y nos da autocompletado mágico mientras escribimos.

¿Por qué lo hacemos así? Para evitar usar 'any' (que es peligroso y nos quita el autocompletado). Con este contrato, el código es seguro: si intentamos usar estas funciones con un objeto que no tiene ID, TypeScript nos avisará con un error antes de que ejecutemos nada. 

Es como decirle al sistema: 'No me importa qué objeto es, siempre y cuando traiga su ID'. Como dice el profe: "Cuando lo vean en acción, se va a entender más". ¡No se queden con dudas, pregunten!
*/

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor() {}

  /**
   * Metodo para obtener datos de Preferences.
   * @param key Clave de la lista en preferences.
   * @returns Lista de datos con el tipo especificado.
   */
  async obtenerLista<T>(key: StorageKey): Promise<T[]> {
    const resultado = await Preferences.get({ key: key });

    if (resultado.value) {
      return JSON.parse(resultado.value);
    }
    return [];
  }

  /**
   * Metodo para obtener un elemento por id de Preferences.
   * @param key Clave de la lista en preferences.
   * @param id ID del elemento a obtener.
   * @returns Objeto con el id solicitado o null si no se encontro.
   */

  async obtenerPorId<T extends WithId>(
    key: StorageKey,
    id: string,
  ): Promise<T | null> {
    const datosActuales = await this.obtenerLista<T>(key);
    return datosActuales.find((item: T) => item.id === id) || null;
  }

  /**
   * Metodo para guardar un elemento en Preferences.
   * @param key Clave de la lista en preferences.
   * @param item Elemento a guardar.
   */

  async guardar<T extends WithId>(key: StorageKey, item: T): Promise<boolean> {
    const datosActuales = await this.obtenerLista<T>(key);

    if (datosActuales.find((i) => i.id === item.id)) {
      return false;
    }

    datosActuales.push(item);
    await Preferences.set({
      key: key,
      value: JSON.stringify(datosActuales),
    });

    return true;
  }

  /**
   * Metodo privado para reemplazar toda la lista de preferences (Ojo con esto equipo.. lo pongo privado para evitar problemas.)
   * @param key Clave de la lista en preferences.
   * @param lista Lista a reemplazar.
   */

  private async reemplazarLista<T>(key: StorageKey, lista: T[]): Promise<void> {
    await Preferences.set({
      key: key,
      value: JSON.stringify(lista),
    });
  }

  /**
   * Obtiene varias colecciones locales para exportacion o respaldo.
   * @param keys Claves exportables a leer.
   * @returns Colecciones encontradas, usando arrays vacios cuando no existen.
   */
  async obtenerColecciones(
    keys: readonly ExportableStorageKey[],
  ): Promise<Record<ExportableStorageKey, unknown[]>> {
    const colecciones = {} as Record<ExportableStorageKey, unknown[]>;

    for (const key of keys) {
      colecciones[key] = await this.obtenerLista<unknown>(key);
    }

    return colecciones;
  }

  /**
   * Reemplaza colecciones locales exportables luego de una validacion externa.
   * @param colecciones Colecciones completas a escribir en Preferences.
   */
  async reemplazarColecciones(
    colecciones: Record<ExportableStorageKey, unknown[]>,
  ): Promise<void> {
    for (const key of EXPORTABLE_STORAGE_KEYS) {
      await this.reemplazarLista<unknown>(key, colecciones[key]);
    }
  }

  /**
   * Metodo para eliminar un elemento por id de Preferences.
   * @param key Clave de la lista en preferences.
   * @param id ID del elemento a eliminar.
   * @returns true si se elimino el elemento, false si no se encontro.
   */

  async eliminarPorId<T extends WithId>(
    key: StorageKey,
    id: string,
  ): Promise<boolean> {
    const datosActuales = await this.obtenerLista<T>(key);

    const resultado = datosActuales.filter((item: T) => item.id !== id);

    if (datosActuales.length === resultado.length) {
      return false;
    }

    await this.reemplazarLista<T>(key, resultado);
    return true;
  }

  /**
   * Metodo para actualizar un elemento dentro de una lista de preferences.
   * @param key Clave de la lista en preferences.
   * @param data Elemento a actualizar.
   * @returns true si se actualizo el elemento, false si no se encontro.
   */
  async actualizar<T extends WithId>(
    key: StorageKey,
    data: T,
  ): Promise<boolean> {
    const datosActuales = await this.obtenerLista<T>(key);
    const index = datosActuales.findIndex((item: T) => item.id === data.id);
    if (index === -1) {
      return false;
    }
    datosActuales[index] = data;
    await this.reemplazarLista<T>(key, datosActuales);
    return true;
  }
}
