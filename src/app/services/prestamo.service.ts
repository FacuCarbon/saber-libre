import { Injectable, inject } from '@angular/core';

import { Ejemplar, Prestamo } from '../models';
import { EjemplarService } from './ejemplar.service';
import { LibroService } from './libro.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class PrestamoService {
  private _storageService = inject(StorageService);
  private _ejemplarService = inject(EjemplarService);
  private _libroService = inject(LibroService);

  /**
   * Obtiene todos los prestamos.
   * @returns Lista de prestamos.
   */
  obtenerPrestamos(): Promise<Prestamo[]> {
    return this._storageService.obtenerLista<Prestamo>('prestamos');
  }

  /**
   * Obtiene un prestamo por su ID.
   * @param idPrestamo El ID del prestamo.
   * @returns El prestamo encontrado o null.
   */
  obtenerPrestamoPorId(idPrestamo: string): Promise<Prestamo | null> {
    return this._storageService.obtenerPorId<Prestamo>('prestamos', idPrestamo);
  }

  /**
   * Obtiene los prestamos de un usuario.
   * @param idUsuario El ID del usuario.
   * @returns Lista de prestamos del usuario.
   */
  async obtenerPrestamosPorUsuario(idUsuario: string): Promise<Prestamo[]> {
    const prestamos = await this.obtenerPrestamos();
    return prestamos.filter((prestamo) => prestamo.idUsuario === idUsuario);
  }

  /**
   * Obtiene los prestamos activos.
   * @returns Lista de prestamos activos.
   */
  async obtenerPrestamosActivos(): Promise<Prestamo[]> {
    const prestamos = await this.obtenerPrestamos();
    return prestamos.filter((prestamo) => !prestamo.fechaDevReal);
  }

  /**
   * Obtiene los prestamos vencidos.
   * @returns Lista de prestamos vencidos.
   */
  async obtenerPrestamosVencidos(): Promise<Prestamo[]> {
    const prestamosActivos = await this.obtenerPrestamosActivos();
    const hoy = new Date();

    return prestamosActivos.filter(
      (prestamo) => new Date(prestamo.fechaDevEstimada) < hoy,
    );
  }

  /**
   * Crea un prestamo para un libro, asignando un ejemplar disponible.
   * @param idUsuario El ID del usuario.
   * @param idLibro El ID del libro.
   * @param idBibliotecario El ID del bibliotecario.
   * @param diasPrestamo Cantidad de dias del prestamo.
   * @returns El prestamo creado o null si no fue posible.
   */
  async crearPrestamo(
    idUsuario: string,
    idLibro: string,
    idBibliotecario: string,
    diasPrestamo = 7,
  ): Promise<Prestamo | null> {
    const ejemplarDisponible =
      await this._ejemplarService.obtenerPrimerDisponiblePorLibro(idLibro);

    if (!ejemplarDisponible) {
      return null;
    }

    const ejemplarReservado: Ejemplar = {
      ...ejemplarDisponible,
      estadoEjemplar: 'prestado',
    };

    const ejemplarActualizado =
      await this._ejemplarService.actualizarEstadoEjemplar(
        ejemplarReservado.id,
        ejemplarReservado.estadoEjemplar,
      );

    if (!ejemplarActualizado) {
      return null;
    }

    const fechaPrestamo = new Date();
    const fechaDevEstimada = new Date(fechaPrestamo);
    fechaDevEstimada.setDate(fechaDevEstimada.getDate() + diasPrestamo);

    const prestamo: Prestamo = {
      id: crypto.randomUUID(),
      idUsuario,
      idEjemplar: ejemplarReservado.id,
      fechaPrestamo: fechaPrestamo.toISOString(),
      fechaDevEstimada: fechaDevEstimada.toISOString(),
      idBibliotecario,
    };

    const guardado = await this._storageService.guardar<Prestamo>(
      'prestamos',
      prestamo,
    );

    if (!guardado) {
      await this._ejemplarService.actualizarEstadoEjemplar(
        ejemplarReservado.id,
        'disponible',
      );
      return null;
    }

    const libroActualizado = await this._libroService.descontarCantidadDisponible(
      idLibro,
    );

    if (!libroActualizado) {
      await this._storageService.eliminarPorId<Prestamo>('prestamos', prestamo.id);
      await this._ejemplarService.actualizarEstadoEjemplar(
        ejemplarReservado.id,
        'disponible',
      );
      return null;
    }

    return prestamo;
  }

  /**
   * Registra la devolucion de un prestamo.
   * @param idPrestamo El ID del prestamo.
   * @returns true si se actualizo correctamente, false en caso contrario.
   */
  async devolverPrestamo(idPrestamo: string): Promise<boolean> {
    const prestamo = await this.obtenerPrestamoPorId(idPrestamo);

    if (!prestamo || prestamo.fechaDevReal) {
      return false;
    }

    const ejemplar = await this._ejemplarService.obtenerEjemplarPorId(
      prestamo.idEjemplar,
    );

    if (!ejemplar) {
      return false;
    }

    const fechaDevReal = new Date().toISOString();

    const prestamoActualizado: Prestamo = {
      ...prestamo,
      fechaDevReal,
    };

    const prestamoGuardado = await this._storageService.actualizar<Prestamo>(
      'prestamos',
      prestamoActualizado,
    );

    if (!prestamoGuardado) {
      return false;
    }

    const ejemplarLiberado = await this._ejemplarService.actualizarEstadoEjemplar(
      ejemplar.id,
      'disponible',
    );

    if (!ejemplarLiberado) {
      await this._storageService.actualizar<Prestamo>(
        'prestamos',
        prestamo,
      );
      return false;
    }

    const libroActualizado = await this._libroService.incrementarCantidadDisponible(
      ejemplar.idLibro,
    );

    if (!libroActualizado) {
      await this._storageService.actualizar<Prestamo>(
        'prestamos',
        prestamo,
      );
      await this._ejemplarService.actualizarEstadoEjemplar(ejemplar.id, 'prestado');
      return false;
    }

    return true;
  }

  /**
   * Alias semantico para registrar una devolucion.
   * @param idPrestamo El ID del prestamo.
   * @returns true si se registro correctamente, false en caso contrario.
   */
  registrarDevolucion(idPrestamo: string): Promise<boolean> {
    return this.devolverPrestamo(idPrestamo);
  }
}
