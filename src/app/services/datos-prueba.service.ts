import { Injectable, inject } from '@angular/core';

import { Ejemplar, Multa, Prestamo } from '../models';
import { AuthService } from './auth.service';
import { EjemplarService } from './ejemplar.service';
import { LibroService } from './libro.service';
import { PerfilUsuarioService } from './perfil-usuario.service';
import { PrestamoService } from './prestamo.service';
import { StorageService } from './storage.service';

export interface ResultadoDatosPrueba {
  exito: boolean;
  mensaje: string;
  yaExistian: boolean;
  prestamosCreados: number;
  multasCreadas: number;
}

@Injectable({
  providedIn: 'root',
})
export class DatosPruebaService {
  private _authService = inject(AuthService);
  private _perfilUsuarioService = inject(PerfilUsuarioService);
  private _ejemplarService = inject(EjemplarService);
  private _libroService = inject(LibroService);
  private _prestamoService = inject(PrestamoService);
  private _storageService = inject(StorageService);

  private readonly idPrestamoVigente = 'datos-prueba-prestamo-vigente';
  private readonly idPrestamoVencido = 'datos-prueba-prestamo-vencido';
  private readonly idPrestamoDevuelto = 'datos-prueba-prestamo-devuelto';
  private readonly idMultaPendiente = 'datos-prueba-multa-pendiente';

  /**
   * Carga prestamos y una multa de prueba sin pisar datos existentes.
   * @returns El resultado de la carga.
   */
  async cargarDatosPrueba(): Promise<ResultadoDatosPrueba> {
    const prestamos = await this._prestamoService.obtenerPrestamos();
    const multas = await this._storageService.obtenerLista<Multa>('multas');
    const idsPrestamos = [
      this.idPrestamoVigente,
      this.idPrestamoVencido,
      this.idPrestamoDevuelto,
    ];
    const prestamosExistentes = prestamos.filter((prestamo) =>
      idsPrestamos.includes(prestamo.id),
    );
    const multaExistente = multas.some(
      (multa) => multa.id === this.idMultaPendiente,
    );

    if (prestamosExistentes.length === 3 && multaExistente) {
      return this.crearResultado(
        true,
        'Los datos de prueba ya estaban cargados.',
        true,
      );
    }

    if (prestamosExistentes.length > 0 || multaExistente) {
      return this.crearResultado(
        false,
        'Hay una carga de prueba incompleta. No se modificaron los datos.',
      );
    }

    const bibliotecario = await this._authService.usuarioActual();
    if (
      !bibliotecario ||
      (bibliotecario.rol !== 'administrador' &&
        bibliotecario.rol !== 'bibliotecario')
    ) {
      return this.crearResultado(
        false,
        'Se necesita un administrador o bibliotecario autenticado.',
      );
    }

    const perfiles = await this._perfilUsuarioService.obtenerPerfiles();
    const lector = perfiles.find((perfil) => perfil.rol === 'lector');
    if (!lector) {
      return this.crearResultado(
        false,
        'No hay lectores registrados para crear los datos de prueba.',
      );
    }

    const ejemplares = await this._ejemplarService.obtenerEjemplares();
    const prestamosActivos = prestamos.filter((prestamo) => !prestamo.fechaDevReal);
    const ejemplaresDisponibles = ejemplares.filter(
      (ejemplar) =>
        ejemplar.estadoEjemplar === 'disponible' &&
        !prestamosActivos.some(
          (prestamo) => prestamo.idEjemplar === ejemplar.id,
        ),
    );
    const ejemplaresValidos: Ejemplar[] = [];

    for (const ejemplar of ejemplaresDisponibles) {
      const libro = await this._libroService.obtenerLibroPorId(ejemplar.idLibro);
      if (libro && libro.activo !== false) {
        ejemplaresValidos.push(ejemplar);
      }

      if (ejemplaresValidos.length === 2) {
        break;
      }
    }

    if (ejemplaresValidos.length < 2) {
      return this.crearResultado(
        false,
        'Se necesitan al menos dos ejemplares disponibles de libros activos.',
      );
    }

    const [ejemplarVigente, ejemplarVencido] = ejemplaresValidos;
    const ahora = new Date();
    const prestamoDevuelto: Prestamo = {
      id: this.idPrestamoDevuelto,
      idUsuario: lector.id,
      idEjemplar: ejemplarVigente.id,
      fechaPrestamo: this.obtenerFecha(ahora, -30),
      fechaDevEstimada: this.obtenerFecha(ahora, -23, true),
      fechaDevReal: this.obtenerFecha(ahora, -22),
      idBibliotecario: bibliotecario.id,
    };
    const prestamoVigente: Prestamo = {
      id: this.idPrestamoVigente,
      idUsuario: lector.id,
      idEjemplar: ejemplarVigente.id,
      fechaPrestamo: ahora.toISOString(),
      fechaDevEstimada: this.obtenerFecha(ahora, 7, true),
      idBibliotecario: bibliotecario.id,
    };
    const prestamoVencido: Prestamo = {
      id: this.idPrestamoVencido,
      idUsuario: lector.id,
      idEjemplar: ejemplarVencido.id,
      fechaPrestamo: this.obtenerFecha(ahora, -20),
      fechaDevEstimada: this.obtenerFecha(ahora, -10, true),
      idBibliotecario: bibliotecario.id,
    };
    const multaPendiente: Multa = {
      id: this.idMultaPendiente,
      idUsuario: lector.id,
      idPrestamo: prestamoVencido.id,
      monto: 1500,
      pagada: false,
    };
    const prestamosNuevos = [
      prestamoDevuelto,
      prestamoVigente,
      prestamoVencido,
    ];
    const idsGuardados: string[] = [];
    let multaGuardada = false;

    try {
      for (const prestamo of prestamosNuevos) {
        const guardado = await this._storageService.guardar<Prestamo>(
          'prestamos',
          prestamo,
        );
        if (!guardado) {
          await this.restaurarCarga(
            idsGuardados,
            multaGuardada,
            ejemplaresValidos,
          );
          return this.crearResultado(false, 'No se pudieron guardar los prestamos.');
        }
        idsGuardados.push(prestamo.id);
      }

      multaGuardada = await this._storageService.guardar<Multa>(
        'multas',
        multaPendiente,
      );
      if (!multaGuardada) {
        await this.restaurarCarga(idsGuardados, false, ejemplaresValidos);
        return this.crearResultado(false, 'No se pudo guardar la multa de prueba.');
      }

      for (const ejemplar of ejemplaresValidos) {
        const actualizado =
          await this._ejemplarService.actualizarEstadoEjemplar(
            ejemplar.id,
            'prestado',
          );
        if (!actualizado) {
          await this.restaurarCarga(
            idsGuardados,
            multaGuardada,
            ejemplaresValidos,
          );
          return this.crearResultado(false, 'No se pudieron reservar los ejemplares.');
        }
      }

      const librosSincronizados = await this.sincronizarLibros(ejemplaresValidos);
      if (!librosSincronizados) {
        await this.restaurarCarga(
          idsGuardados,
          multaGuardada,
          ejemplaresValidos,
        );
        return this.crearResultado(false, 'No se pudo sincronizar el inventario.');
      }

      return {
        exito: true,
        mensaje: 'Datos de prueba cargados correctamente.',
        yaExistian: false,
        prestamosCreados: 3,
        multasCreadas: 1,
      };
    } catch (error) {
      console.error(error);
      await this.restaurarCarga(
        idsGuardados,
        multaGuardada,
        ejemplaresValidos,
      );
      return this.crearResultado(false, 'Ocurrio un error al cargar los datos de prueba.');
    }
  }

  private obtenerFecha(fechaBase: Date, dias: number, finDelDia = false): string {
    const fecha = new Date(fechaBase);
    fecha.setDate(fecha.getDate() + dias);
    if (finDelDia) {
      fecha.setHours(23, 59, 59, 999);
    }
    return fecha.toISOString();
  }

  private crearResultado(
    exito: boolean,
    mensaje: string,
    yaExistian = false,
  ): ResultadoDatosPrueba {
    return {
      exito,
      mensaje,
      yaExistian,
      prestamosCreados: 0,
      multasCreadas: 0,
    };
  }

  private async sincronizarLibros(ejemplares: Ejemplar[]): Promise<boolean> {
    const idsLibros = [...new Set(ejemplares.map((ejemplar) => ejemplar.idLibro))];
    for (const idLibro of idsLibros) {
      const sincronizado =
        await this._libroService.sincronizarCantidadesDesdeEjemplares(idLibro);
      if (!sincronizado) {
        return false;
      }
    }
    return true;
  }

  private async restaurarCarga(
    idsPrestamos: string[],
    multaGuardada: boolean,
    ejemplares: Ejemplar[],
  ): Promise<void> {
    if (multaGuardada) {
      await this._storageService.eliminarPorId<Multa>(
        'multas',
        this.idMultaPendiente,
      );
    }

    for (const idPrestamo of idsPrestamos) {
      await this._storageService.eliminarPorId<Prestamo>(
        'prestamos',
        idPrestamo,
      );
    }

    for (const ejemplar of ejemplares) {
      await this._ejemplarService.actualizarEjemplar(ejemplar);
    }

    await this.sincronizarLibros(ejemplares);
  }
}
