import { Injectable, inject } from '@angular/core';

import { Ejemplar, Multa, Prestamo, Usuario } from '../models';
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
  private readonly idPrestamoVencidoSinMulta =
    'datos-prueba-prestamo-vencido-sin-multa';
  private readonly idPrestamoDevuelto = 'datos-prueba-prestamo-devuelto';
  private readonly idMultaPendiente = 'datos-prueba-multa-pendiente';

  /**
   * Carga prestamos y una multa de prueba sin pisar datos existentes.
   * Si ya existe la base cargada por una version anterior (sin el escenario
   * de prestamo vencido sin multa), solo agrega ese escenario faltante.
   * @returns El resultado de la carga.
   */
  async cargarDatosPrueba(): Promise<ResultadoDatosPrueba> {
    const prestamos = await this._prestamoService.obtenerPrestamos();
    const multas = await this._storageService.obtenerLista<Multa>('multas');

    const idsPrestamosBase = [
      this.idPrestamoVigente,
      this.idPrestamoVencido,
      this.idPrestamoDevuelto,
    ];
    const prestamosBaseExistentes = prestamos.filter((prestamo) =>
      idsPrestamosBase.includes(prestamo.id),
    );
    const multaExistente = multas.some(
      (multa) => multa.id === this.idMultaPendiente,
    );
    const vencidoSinMultaExistente = prestamos.some(
      (prestamo) => prestamo.id === this.idPrestamoVencidoSinMulta,
    );
    const baseCompleta = prestamosBaseExistentes.length === 3 && multaExistente;

    if (baseCompleta && vencidoSinMultaExistente) {
      return this.crearResultado(
        true,
        'Los datos de prueba ya estaban cargados.',
        true,
      );
    }

    if (!baseCompleta && (prestamosBaseExistentes.length > 0 || multaExistente)) {
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

    if (baseCompleta) {
      return this.agregarEscenarioVencidoSinMulta(bibliotecario, lector);
    }

    return this.crearEscenarioCompleto(bibliotecario, lector);
  }

  private async crearEscenarioCompleto(
    bibliotecario: Usuario,
    lector: Usuario,
  ): Promise<ResultadoDatosPrueba> {
    const ejemplaresValidos = await this.seleccionarEjemplaresValidos(3);

    if (ejemplaresValidos.length < 3) {
      return this.crearResultado(
        false,
        'Se necesitan al menos tres ejemplares disponibles de libros activos.',
      );
    }

    const [ejemplarVigente, ejemplarVencido, ejemplarVencidoSinMulta] =
      ejemplaresValidos;
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
    const prestamoVencidoSinMulta: Prestamo = {
      id: this.idPrestamoVencidoSinMulta,
      idUsuario: lector.id,
      idEjemplar: ejemplarVencidoSinMulta.id,
      fechaPrestamo: this.obtenerFecha(ahora, -15),
      fechaDevEstimada: this.obtenerFecha(ahora, -5, true),
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
      prestamoVencidoSinMulta,
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
          await this.restaurarCarga(idsGuardados, false, ejemplaresValidos);
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
        prestamosCreados: 4,
        multasCreadas: 1,
      };
    } catch (error) {
      console.error(error);
      await this.restaurarCarga(idsGuardados, multaGuardada, ejemplaresValidos);
      return this.crearResultado(false, 'Ocurrio un error al cargar los datos de prueba.');
    }
  }

  private async agregarEscenarioVencidoSinMulta(
    bibliotecario: Usuario,
    lector: Usuario,
  ): Promise<ResultadoDatosPrueba> {
    const ejemplaresValidos = await this.seleccionarEjemplaresValidos(1);

    if (ejemplaresValidos.length < 1) {
      return this.crearResultado(
        false,
        'Se necesita al menos un ejemplar disponible de un libro activo.',
      );
    }

    const [ejemplarVencidoSinMulta] = ejemplaresValidos;
    const ahora = new Date();
    const prestamoVencidoSinMulta: Prestamo = {
      id: this.idPrestamoVencidoSinMulta,
      idUsuario: lector.id,
      idEjemplar: ejemplarVencidoSinMulta.id,
      fechaPrestamo: this.obtenerFecha(ahora, -15),
      fechaDevEstimada: this.obtenerFecha(ahora, -5, true),
      idBibliotecario: bibliotecario.id,
    };

    try {
      const guardado = await this._storageService.guardar<Prestamo>(
        'prestamos',
        prestamoVencidoSinMulta,
      );
      if (!guardado) {
        return this.crearResultado(false, 'No se pudo guardar el prestamo.');
      }

      const actualizado = await this._ejemplarService.actualizarEstadoEjemplar(
        ejemplarVencidoSinMulta.id,
        'prestado',
      );
      if (!actualizado) {
        await this.restaurarCarga(
          [prestamoVencidoSinMulta.id],
          false,
          ejemplaresValidos,
        );
        return this.crearResultado(false, 'No se pudo reservar el ejemplar.');
      }

      const librosSincronizados = await this.sincronizarLibros(ejemplaresValidos);
      if (!librosSincronizados) {
        await this.restaurarCarga(
          [prestamoVencidoSinMulta.id],
          false,
          ejemplaresValidos,
        );
        return this.crearResultado(false, 'No se pudo sincronizar el inventario.');
      }

      return {
        exito: true,
        mensaje:
          'Se agregó el escenario de préstamo vencido sin multa a los datos de prueba.',
        yaExistian: false,
        prestamosCreados: 1,
        multasCreadas: 0,
      };
    } catch (error) {
      console.error(error);
      await this.restaurarCarga(
        [prestamoVencidoSinMulta.id],
        false,
        ejemplaresValidos,
      );
      return this.crearResultado(false, 'Ocurrio un error al cargar los datos de prueba.');
    }
  }

  private async seleccionarEjemplaresValidos(
    cantidad: number,
  ): Promise<Ejemplar[]> {
    const libros = await this._libroService.obtenerLibros();
    const ordenLibros = new Map(libros.map((libro, indice) => [libro.id, indice]));

    const [ejemplares, prestamos] = await Promise.all([
      this._ejemplarService.obtenerEjemplares(),
      this._prestamoService.obtenerPrestamos(),
    ]);
    const prestamosActivos = prestamos.filter((prestamo) => !prestamo.fechaDevReal);

    const ejemplaresDisponibles = ejemplares
      .filter(
        (ejemplar) =>
          ejemplar.estadoEjemplar === 'disponible' &&
          !prestamosActivos.some(
            (prestamo) => prestamo.idEjemplar === ejemplar.id,
          ),
      )
      .sort(
        (a, b) =>
          (ordenLibros.get(b.idLibro) ?? -1) -
          (ordenLibros.get(a.idLibro) ?? -1),
      );

    const ejemplaresValidos: Ejemplar[] = [];

    for (const ejemplar of ejemplaresDisponibles) {
      const libro = libros.find((item) => item.id === ejemplar.idLibro);
      if (libro && libro.activo !== false) {
        ejemplaresValidos.push(ejemplar);
      }

      if (ejemplaresValidos.length === cantidad) {
        break;
      }
    }

    return ejemplaresValidos;
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
