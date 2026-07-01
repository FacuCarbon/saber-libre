import { Injectable, inject } from '@angular/core';

import { Ejemplar, EstadoEjemplar } from '../models/ejemplar.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class EjemplarService {
  private _storageService = inject(StorageService);

  /**
   * Obtiene todos los ejemplares.
   * @returns Lista de ejemplares.
   */
  obtenerEjemplares(): Promise<Ejemplar[]> {
    return this._storageService.obtenerLista<Ejemplar>('ejemplares');
  }

  /**
   * Obtiene un ejemplar por su ID.
   * @param idEjemplar El ID del ejemplar.
   * @returns El ejemplar encontrado o null.
   */
  obtenerEjemplarPorId(idEjemplar: string): Promise<Ejemplar | null> {
    return this._storageService.obtenerPorId<Ejemplar>('ejemplares', idEjemplar);
  }

  /**
   * Obtiene un ejemplar por su codigo de barras.
   * @param codigoBarras El codigo de barras del ejemplar.
   * @returns El ejemplar encontrado o null.
   */
  async obtenerEjemplarPorCodigoBarras(
    codigoBarras: string,
  ): Promise<Ejemplar | null> {
    const codigoBuscado = codigoBarras.trim().toLowerCase();

    if (!codigoBuscado) {
      return null;
    }

    const ejemplares = await this.obtenerEjemplares();
    return (
      ejemplares.find(
        (ejemplar) => ejemplar.codigoBarras.toLowerCase() === codigoBuscado,
      ) ?? null
    );
  }

  /**
   * Obtiene todos los ejemplares de un libro.
   * @param idLibro El ID del libro.
   * @returns Lista de ejemplares asociados al libro.
   */
  async obtenerEjemplaresPorLibro(idLibro: string): Promise<Ejemplar[]> {
    const ejemplares = await this.obtenerEjemplares();
    return ejemplares.filter((ejemplar) => ejemplar.idLibro === idLibro);
  }

  /**
   * Obtiene los ejemplares disponibles de un libro.
   * @param idLibro El ID del libro.
   * @returns Lista de ejemplares disponibles.
   */
  async obtenerEjemplaresDisponiblesPorLibro(
    idLibro: string,
  ): Promise<Ejemplar[]> {
    const ejemplares = await this.obtenerEjemplaresPorLibro(idLibro);
    return ejemplares.filter(
      (ejemplar) => ejemplar.estadoEjemplar === 'disponible',
    );
  }

  /**
   * Obtiene los ejemplares prestados de un libro.
   * @param idLibro El ID del libro.
   * @returns Lista de ejemplares prestados.
   */
  async obtenerEjemplaresPrestadosPorLibro(idLibro: string): Promise<Ejemplar[]> {
    const ejemplares = await this.obtenerEjemplaresPorLibro(idLibro);
    return ejemplares.filter(
      (ejemplar) => ejemplar.estadoEjemplar === 'prestado',
    );
  }

  /**
   * Obtiene el primer ejemplar disponible de un libro.
   * @param idLibro El ID del libro.
   * @returns El ejemplar disponible o null.
   */
  async obtenerPrimerDisponiblePorLibro(
    idLibro: string,
  ): Promise<Ejemplar | null> {
    const ejemplaresDisponibles =
      await this.obtenerEjemplaresDisponiblesPorLibro(idLibro);
    return ejemplaresDisponibles[0] ?? null;
  }

  /**
   * Guarda un ejemplar.
   * @param ejemplar El ejemplar a guardar.
   * @returns true si se guardo correctamente, false en caso contrario.
   */
  guardarEjemplar(ejemplar: Ejemplar): Promise<boolean> {
    return this._storageService.guardar<Ejemplar>('ejemplares', ejemplar);
  }

  /**
   * Actualiza los datos de un ejemplar.
   * @param ejemplar El ejemplar a actualizar.
   * @returns true si se actualizo correctamente, false en caso contrario.
   */
  actualizarEjemplar(ejemplar: Ejemplar): Promise<boolean> {
    return this._storageService.actualizar<Ejemplar>('ejemplares', ejemplar);
  }

  /**
   * Crea varias copias para un libro.
   * @param idLibro El ID del libro.
   * @param cantidad La cantidad de ejemplares a crear.
   * @param ubicacion La ubicacion de los ejemplares.
   * @returns Lista de ejemplares creados.
   */
  async crearEjemplaresParaLibro(
    idLibro: string,
    cantidad: number,
    ubicacion: string,
  ): Promise<Ejemplar[]> {
    if (cantidad <= 0) {
      return [];
    }

    const creados: Ejemplar[] = [];

    for (let indice = 0; indice < cantidad; indice++) {
      const ejemplar: Ejemplar = {
        id: crypto.randomUUID(),
        idLibro,
        codigoBarras: await this.generarCodigoBarrasUnico(),
        estadoEjemplar: 'disponible',
        ubicacion,
      };

      const guardado = await this.guardarEjemplar(ejemplar);
      if (!guardado) {
        break;
      }

      creados.push(ejemplar);
    }

    return creados;
  }

  /**
   * Genera un codigo de barras corto (formato EX-XXXXXXXX, apto para CODE128)
   * y verifica que no colisione con uno existente.
   * @returns El codigo de barras unico generado.
   */
  private async generarCodigoBarrasUnico(): Promise<string> {
    let codigo: string;

    do {
      codigo = `EX-${this.generarSufijoAleatorio(8)}`;
    } while (await this.obtenerEjemplarPorCodigoBarras(codigo));

    return codigo;
  }

  private generarSufijoAleatorio(longitud: number): string {
    const alfabeto = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    const valoresAleatorios = new Uint32Array(longitud);
    crypto.getRandomValues(valoresAleatorios);

    let sufijo = '';
    for (const valor of valoresAleatorios) {
      sufijo += alfabeto[valor % alfabeto.length];
    }

    return sufijo;
  }

  /**
   * Actualiza el estado de un ejemplar.
   * @param idEjemplar El ID del ejemplar.
   * @param estado El nuevo estado.
   * @returns true si se actualizo correctamente, false en caso contrario.
   */
  async actualizarEstadoEjemplar(
    idEjemplar: string,
    estado: EstadoEjemplar,
  ): Promise<boolean> {
    const ejemplar = await this.obtenerEjemplarPorId(idEjemplar);

    if (!ejemplar) {
      return false;
    }

    ejemplar.estadoEjemplar = estado;
    return this._storageService.actualizar<Ejemplar>('ejemplares', ejemplar);
  }

  /**
   * Elimina todos los ejemplares asociados a un libro.
   * @param idLibro El ID del libro.
   * @returns true si al menos un ejemplar fue eliminado, false si no hubo coincidencias.
   */
  async eliminarEjemplaresPorLibro(idLibro: string): Promise<boolean> {
    const ejemplares = await this.obtenerEjemplaresPorLibro(idLibro);

    if (ejemplares.length === 0) {
      return false;
    }

    let eliminados = 0;
    for (const ejemplar of ejemplares) {
      const resultado = await this._storageService.eliminarPorId<Ejemplar>(
        'ejemplares',
        ejemplar.id,
      );
      if (resultado) {
        eliminados++;
      }
    }

    return eliminados > 0;
  }
}
