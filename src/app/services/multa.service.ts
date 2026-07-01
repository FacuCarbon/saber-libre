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

  /**
   * Obtiene una multa por su ID.
   * @param idMulta El ID de la multa.
   * @returns La multa o null si no se encontro.
   */
  obtenerMultaPorId(idMulta: string): Promise<Multa | null> {
    return this._storageService.obtenerPorId<Multa>('multas', idMulta);
  }

  /**
   * Obtiene la multa asociada a un prestamo.
   * @param idPrestamo El ID del prestamo.
   * @returns La multa o null si no existe.
   */
  async obtenerMultaPorPrestamo(idPrestamo: string): Promise<Multa | null> {
    const multas = await this.obtenerMultas();
    return multas.find((multa) => multa.idPrestamo === idPrestamo) ?? null;
  }

  /**
   * Crea una multa para un prestamo vencido.
   * @param idUsuario El ID del usuario lector.
   * @param idPrestamo El ID del prestamo vencido.
   * @param monto El monto de la multa.
   * @returns La multa creada o null si no se pudo crear.
   */
  async crearMulta(
    idUsuario: string,
    idPrestamo: string,
    monto: number,
  ): Promise<Multa | null> {
    if (!idUsuario.trim() || !idPrestamo.trim() || monto <= 0) {
      return null;
    }

    const multaExistente = await this.obtenerMultaPorPrestamo(idPrestamo);
    if (multaExistente) {
      return null;
    }

    const multa: Multa = {
      id: crypto.randomUUID(),
      idUsuario,
      idPrestamo,
      monto,
      pagada: false,
    };

    try {
      const multaGuardada = await this.guardarMulta(multa);
      return multaGuardada ? multa : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  /**
   * Marca una multa como pagada.
   * @param idMulta El ID de la multa.
   * @returns true si se actualizo correctamente, false en caso contrario.
   */
  async pagarMulta(idMulta: string): Promise<boolean> {
    const multa = await this.obtenerMultaPorId(idMulta);
    if (!multa || multa.pagada) {
      return false;
    }

    try {
      return await this._storageService.actualizar<Multa>('multas', {
        ...multa,
        pagada: true,
      });
    } catch (error) {
      console.error(error);
      return false;
    }
  }
}
