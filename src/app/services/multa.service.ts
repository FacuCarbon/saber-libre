import { Injectable, inject } from '@angular/core';

import { Multa } from '../models';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class MultaService {
  private _storageService = inject(StorageService);

  /**
   * Obtiene todas las multas.
   * @returns Lista de multas.
   */
  obtenerMultas(): Promise<Multa[]> {
    return this._storageService.obtenerLista<Multa>('multas');
  }

  /**
   * Obtiene las multas de un usuario.
   * @param idUsuario El ID del usuario.
   * @returns Lista de multas del usuario.
   */
  async obtenerMultasPorUsuario(idUsuario: string): Promise<Multa[]> {
    const multas = await this.obtenerMultas();
    return multas.filter((multa) => multa.idUsuario === idUsuario);
  }

  /**
   * Obtiene la primera multa pendiente de un usuario.
   * @param idUsuario El ID del usuario.
   * @returns La multa pendiente o null.
   */
  async obtenerMultaPendientePorUsuario(
    idUsuario: string,
  ): Promise<Multa | null> {
    const multas = await this.obtenerMultasPorUsuario(idUsuario);
    return multas.find((multa) => !multa.pagada) ?? null;
  }

  /**
   * Indica si un usuario tiene una multa pendiente.
   * @param idUsuario El ID del usuario.
   * @returns true si tiene una multa pendiente, false en caso contrario.
   */
  async tieneMultaPendiente(idUsuario: string): Promise<boolean> {
    const multa = await this.obtenerMultaPendientePorUsuario(idUsuario);
    return multa !== null;
  }

  /**
   * Guarda una multa.
   * @param multa La multa a guardar.
   * @returns true si se guardo correctamente, false en caso contrario.
   */
  guardarMulta(multa: Multa): Promise<boolean> {
    return this._storageService.guardar<Multa>('multas', multa);
  }
}
