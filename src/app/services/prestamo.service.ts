import { Injectable, inject } from '@angular/core';

import { Ejemplar, Prestamo } from '../models';
import { EjemplarService } from './ejemplar.service';
import { LibroService } from './libro.service';
import { MultaService } from './multa.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class PrestamoService {
  private _storageService = inject(StorageService);
  private _ejemplarService = inject(EjemplarService);
  private _libroService = inject(LibroService);
  private _multaService = inject(MultaService);

  /** Obtiene todos los prestamos. */
  obtenerPrestamos(): Promise<Prestamo[]> {
    return this._storageService.obtenerLista<Prestamo>('prestamos');
  }

  /** Obtiene un prestamo por su ID. */
  obtenerPrestamoPorId(idPrestamo: string): Promise<Prestamo | null> {
    return this._storageService.obtenerPorId<Prestamo>('prestamos', idPrestamo);
  }

  /** Obtiene los prestamos de un usuario. */
  async obtenerPrestamosPorUsuario(idUsuario: string): Promise<Prestamo[]> {
    const prestamos = await this.obtenerPrestamos();
    return prestamos.filter((prestamo) => prestamo.idUsuario === idUsuario);
  }

  /** Obtiene los prestamos activos, incluidos los vencidos. */
  async obtenerPrestamosActivos(): Promise<Prestamo[]> {
    const prestamos = await this.obtenerPrestamos();
    return prestamos.filter((prestamo) => !prestamo.fechaDevReal);
  }

  /** Obtiene los prestamos activos que superaron su fecha estimada. */
  async obtenerPrestamosVencidos(): Promise<Prestamo[]> {
    const prestamosActivos = await this.obtenerPrestamosActivos();
    const ahora = new Date();
    return prestamosActivos.filter(
      (prestamo) => new Date(prestamo.fechaDevEstimada) < ahora,
    );
  }

  /** Obtiene los prestamos que ya fueron devueltos. */
  async obtenerPrestamosDevueltos(): Promise<Prestamo[]> {
    const prestamos = await this.obtenerPrestamos();
    return prestamos.filter((prestamo) => Boolean(prestamo.fechaDevReal));
  }

  /** Obtiene el prestamo activo de un ejemplar. */
  async obtenerPrestamoActivoPorEjemplar(
    idEjemplar: string,
  ): Promise<Prestamo | null> {
    const prestamosActivos = await this.obtenerPrestamosActivos();
    return (
      prestamosActivos.find(
        (prestamo) => prestamo.idEjemplar === idEjemplar,
      ) ?? null
    );
  }

  /**
   * Crea un prestamo para un ejemplar concreto.
   * @param idUsuario El ID del usuario lector.
   * @param idEjemplar El ID del ejemplar.
   * @param idBibliotecario El ID del bibliotecario responsable.
   * @param fechaDevEstimada La fecha estimada de devolucion.
   */
  async crearPrestamo(
    idUsuario: string,
    idEjemplar: string,
    idBibliotecario: string,
    fechaDevEstimada: string,
  ): Promise<Prestamo | null> {
    if (!idUsuario.trim() || !idEjemplar.trim() || !idBibliotecario.trim()) {
      return null;
    }

    const fechaDevolucion = this.normalizarFechaDevolucion(fechaDevEstimada);
    const inicioHoy = new Date();
    inicioHoy.setHours(0, 0, 0, 0);

    if (!fechaDevolucion || fechaDevolucion < inicioHoy) {
      return null;
    }

    const ejemplar = await this._ejemplarService.obtenerEjemplarPorId(idEjemplar);
    if (!ejemplar || ejemplar.estadoEjemplar !== 'disponible') {
      return null;
    }

    const libro = await this._libroService.obtenerLibroPorId(ejemplar.idLibro);
    if (!libro || libro.activo === false) {
      return null;
    }

    const [prestamoDuplicado, tieneMultaPendiente] = await Promise.all([
      this.obtenerPrestamoActivoPorEjemplar(idEjemplar),
      this._multaService.tieneMultaPendiente(idUsuario),
    ]);
    if (prestamoDuplicado || tieneMultaPendiente) {
      return null;
    }

    const prestamo: Prestamo = {
      id: crypto.randomUUID(),
      idUsuario,
      idEjemplar,
      fechaPrestamo: new Date().toISOString(),
      fechaDevEstimada: fechaDevolucion.toISOString(),
      idBibliotecario,
    };

    try {
      const ejemplarReservado =
        await this._ejemplarService.actualizarEstadoEjemplar(
          idEjemplar,
          'prestado',
        );
      if (!ejemplarReservado) {
        return null;
      }

      const prestamoGuardado = await this._storageService.guardar<Prestamo>(
        'prestamos',
        prestamo,
      );
      if (!prestamoGuardado) {
        await this.restaurarAltaFallida(prestamo, ejemplar);
        return null;
      }

      const libroSincronizado =
        await this._libroService.sincronizarCantidadesDesdeEjemplares(
          ejemplar.idLibro,
        );
      if (!libroSincronizado) {
        await this.restaurarAltaFallida(prestamo, ejemplar);
        return null;
      }

      return prestamo;
    } catch (error) {
      console.error(error);
      await this.restaurarAltaFallida(prestamo, ejemplar);
      return null;
    }
  }

  /** Registra la devolucion de un prestamo. */
  async devolverPrestamo(idPrestamo: string): Promise<boolean> {
    const prestamo = await this.obtenerPrestamoPorId(idPrestamo);
    if (!prestamo || prestamo.fechaDevReal) {
      return false;
    }

    const ejemplar = await this._ejemplarService.obtenerEjemplarPorId(
      prestamo.idEjemplar,
    );
    if (!ejemplar || ejemplar.estadoEjemplar !== 'prestado') {
      return false;
    }

    const prestamoActualizado: Prestamo = {
      ...prestamo,
      fechaDevReal: new Date().toISOString(),
    };

    try {
      const prestamoGuardado = await this._storageService.actualizar<Prestamo>(
        'prestamos',
        prestamoActualizado,
      );
      if (!prestamoGuardado) {
        return false;
      }

      const ejemplarLiberado =
        await this._ejemplarService.actualizarEstadoEjemplar(
          ejemplar.id,
          'disponible',
        );
      if (!ejemplarLiberado) {
        await this._storageService.actualizar<Prestamo>('prestamos', prestamo);
        return false;
      }

      const libroSincronizado =
        await this._libroService.sincronizarCantidadesDesdeEjemplares(
          ejemplar.idLibro,
        );
      if (!libroSincronizado) {
        await this.restaurarDevolucionFallida(prestamo, ejemplar);
        return false;
      }

      return true;
    } catch (error) {
      console.error(error);
      await this.restaurarDevolucionFallida(prestamo, ejemplar);
      return false;
    }
  }

  /** Alias semantico para registrar una devolucion. */
  registrarDevolucion(idPrestamo: string): Promise<boolean> {
    return this.devolverPrestamo(idPrestamo);
  }

  private normalizarFechaDevolucion(fecha: string): Date | null {
    const fechaNormalizada = /^\d{4}-\d{2}-\d{2}$/.test(fecha)
      ? new Date(`${fecha}T23:59:59.999`)
      : new Date(fecha);
    if (Number.isNaN(fechaNormalizada.getTime())) {
      return null;
    }

    fechaNormalizada.setHours(23, 59, 59, 999);
    return fechaNormalizada;
  }

  private async restaurarAltaFallida(
    prestamo: Prestamo,
    ejemplar: Ejemplar,
  ): Promise<void> {
    await this._storageService.eliminarPorId<Prestamo>(
      'prestamos',
      prestamo.id,
    );
    await this._ejemplarService.actualizarEjemplar(ejemplar);
    await this._libroService.sincronizarCantidadesDesdeEjemplares(
      ejemplar.idLibro,
    );
  }

  private async restaurarDevolucionFallida(
    prestamo: Prestamo,
    ejemplar: Ejemplar,
  ): Promise<void> {
    await this._storageService.actualizar<Prestamo>('prestamos', prestamo);
    await this._ejemplarService.actualizarEjemplar(ejemplar);
    await this._libroService.sincronizarCantidadesDesdeEjemplares(
      ejemplar.idLibro,
    );
  }
}
