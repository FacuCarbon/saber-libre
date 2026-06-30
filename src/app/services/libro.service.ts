import { Injectable, inject } from '@angular/core';

import { EjemplarService } from './ejemplar.service';
import { Libro } from '../models/libro.model';
import { VolumenGoogleBooks } from '../models/google-books.model';
import { GoogleBooksService } from './google-books.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class LibroService {
  private _storageService = inject(StorageService);
  private _googleBooksService = inject(GoogleBooksService);
  private _ejemplarService = inject(EjemplarService);

  /**
   * Busca un libro por su ISBN.
   * @param isbn El ISBN del libro a buscar.
   * @returns El libro encontrado o null si no se encuentra.
   */
  buscarPorIsbn(isbn: string): Promise<VolumenGoogleBooks | null> {
    return this._googleBooksService.buscarPorIsbn(isbn);
  }

  /**
   * Busca libros por su título.
   * @param titulo El título del libro a buscar.
   * @returns Una lista de libros encontrados.
   */
  buscarPorTitulo(titulo: string): Promise<VolumenGoogleBooks[]> {
    return this._googleBooksService.buscarPorTitulo(titulo);
  }

  /**
   * Obtiene todos los libros.
   * @returns Una lista de libros.
   */
  obtenerLibros(): Promise<Libro[]> {
    return this._storageService.obtenerLista<Libro>('libros');
  }

  /**
   * Obtiene un libro por su ID.
   * @param id El ID del libro a obtener.
   * @returns El libro encontrado o null si no se encuentra.
   */
  obtenerLibroPorId(id: string): Promise<Libro | null> {
    return this._storageService.obtenerPorId<Libro>('libros', id);
  }

  /**
   * Busca libros por su título, categoría o autor.
   * @param query El término de búsqueda.
   * @returns Una lista de libros encontrados.
   */
  async buscarLibro(query: string): Promise<Libro[]> {
    const catalogo = await this.obtenerLibros();
    const libros: Libro[] = catalogo.filter((libro) => {
      if (libro.activo === false) {
        return false;
      }

      if (libro.titulo.toLowerCase().includes(query.toLowerCase())) {
        return true;
      }
      if (
        libro.autores.some((autor) =>
          autor.toLowerCase().includes(query.toLowerCase()),
        )
      ) {
        return true;
      }
      if (
        libro.categorias.some((categoria) =>
          categoria.toLowerCase().includes(query.toLowerCase()),
        )
      ) {
        return true;
      }
      return false;
    });
    return libros;
  }

  /**
   * Actualiza un libro.
   * @param libro El libro a actualizar.
   * @returns true si el libro se actualizó correctamente, false en caso contrario.
   */
  actualizarLibro(libro: Libro): Promise<boolean> {
    return this._storageService.actualizar<Libro>('libros', libro);
  }

  /**
   * Da de baja un libro sin eliminarlo del almacenamiento.
   * @param idLibro El ID del libro.
   * @returns true si se dio de baja correctamente, false en caso contrario.
   */
  async darDeBajaLibro(idLibro: string): Promise<boolean> {
    const libro = await this.obtenerLibroPorId(idLibro);

    if (!libro || libro.activo === false) {
      return false;
    }

    const ejemplares =
      await this._ejemplarService.obtenerEjemplaresPorLibro(idLibro);
    const tieneEjemplaresPrestados = ejemplares.some(
      (ejemplar) => ejemplar.estadoEjemplar === 'prestado',
    );

    if (tieneEjemplaresPrestados) {
      return false;
    }

    libro.activo = false;
    return this.actualizarLibro(libro);
  }

  /**
   * Reactiva un libro dado de baja.
   * @param idLibro El ID del libro.
   * @returns true si se reactivo correctamente, false en caso contrario.
   */
  async reactivarLibro(idLibro: string): Promise<boolean> {
    const libro = await this.obtenerLibroPorId(idLibro);

    if (!libro || libro.activo !== false) {
      return false;
    }

    libro.activo = true;
    return this.actualizarLibro(libro);
  }

  /**
   * Recalcula las cantidades de un libro desde sus ejemplares activos.
   * @param idLibro El ID del libro.
   * @returns true si el libro se actualizo correctamente, false en caso contrario.
   */
  async sincronizarCantidadesDesdeEjemplares(
    idLibro: string,
  ): Promise<boolean> {
    const libro = await this.obtenerLibroPorId(idLibro);

    if (!libro) {
      return false;
    }

    const ejemplares =
      await this._ejemplarService.obtenerEjemplaresPorLibro(idLibro);
    const ejemplaresActivos = ejemplares.filter(
      (ejemplar) => ejemplar.estadoEjemplar !== 'baja',
    );

    libro.cantidadTotal = ejemplaresActivos.length;
    libro.cantidadDisponible = ejemplaresActivos.filter(
      (ejemplar) => ejemplar.estadoEjemplar === 'disponible',
    ).length;

    return this.actualizarLibro(libro);
  }

  /**
   * Actualiza la cantidad disponible de un libro.
   * @param idLibro El ID del libro.
   * @param cantidadDisponible La nueva cantidad disponible.
   * @returns true si el libro se actualizo correctamente, false en caso contrario.
   */
  async actualizarCantidadDisponible(
    idLibro: string,
    cantidadDisponible: number,
  ): Promise<boolean> {
    const libro = await this.obtenerLibroPorId(idLibro);

    if (!libro) {
      return false;
    }

    if (
      cantidadDisponible < 0 ||
      cantidadDisponible > libro.cantidadTotal
    ) {
      return false;
    }

    libro.cantidadDisponible = cantidadDisponible;
    return this.actualizarLibro(libro);
  }

  /**
   * Disminuye la cantidad disponible de un libro.
   * @param idLibro El ID del libro.
   * @param cantidad La cantidad a descontar.
   * @returns true si se actualizo correctamente, false en caso contrario.
   */
  async descontarCantidadDisponible(
    idLibro: string,
    cantidad = 1,
  ): Promise<boolean> {
    const libro = await this.obtenerLibroPorId(idLibro);

    if (!libro) {
      return false;
    }

    return this.actualizarCantidadDisponible(
      idLibro,
      libro.cantidadDisponible - cantidad,
    );
  }

  /**
   * Aumenta la cantidad disponible de un libro.
   * @param idLibro El ID del libro.
   * @param cantidad La cantidad a sumar.
   * @returns true si se actualizo correctamente, false en caso contrario.
   */
  async incrementarCantidadDisponible(
    idLibro: string,
    cantidad = 1,
  ): Promise<boolean> {
    const libro = await this.obtenerLibroPorId(idLibro);

    if (!libro) {
      return false;
    }

    return this.actualizarCantidadDisponible(
      idLibro,
      libro.cantidadDisponible + cantidad,
    );
  }

  /**
   * Elimina un libro por su ID.
   * @param id El ID del libro a eliminar.
   * @returns true si el libro se eliminó correctamente, false en caso contrario.
   */
  eliminarLibro(id: string): Promise<boolean> {
    return this._storageService.eliminarPorId<Libro>('libros', id);
  }

  /**
   * Guarda un libro.
   * @param volumen El volumen del libro.
   * @param cantidad La cantidad del libro.
   * @returns true si el libro se guardó correctamente, false en caso contrario.
   */
  async guardarLibro(
    volumen: VolumenGoogleBooks,
    cantidad: number,
  ): Promise<boolean> {
    if (cantidad <= 0) {
      throw new Error('La cantidad debe ser mayor a cero.');
    }

    const isbn =
      volumen.industryIdentifiers?.find(
        (identificador) => identificador.type === 'ISBN_13',
      )?.identifier ??
      volumen.industryIdentifiers?.find(
        (identificador) => identificador.type === 'ISBN_10',
      )?.identifier;

    if (!isbn) {
      throw new Error('El libro no tiene un ISBN.');
    }

    const libros = await this.obtenerLibros();
    const libroExistente = libros.some((libro) => libro.isbn === isbn);

    if (libroExistente) {
      return false;
    }

    const nuevoLibro: Libro = {
      id: crypto.randomUUID(),
      isbn,
      titulo: volumen.title,
      autores: volumen.authors ?? [],
      categorias: volumen.categories ?? [],
      cantidadTotal: cantidad,
      cantidadDisponible: cantidad,
      activo: true,
      imagenPortada: volumen.imageLinks?.thumbnail,
      descripcion: volumen.description,
    };

    return this._storageService.guardar<Libro>('libros', nuevoLibro);
  }

  /**
   * Guarda un libro y crea sus ejemplares en una sola operacion.
   * @param volumen El volumen del libro.
   * @param cantidad La cantidad total de ejemplares.
   * @param ubicacion La ubicacion inicial de los ejemplares.
   * @returns true si se guardo todo correctamente, false en caso contrario.
   */
  async guardarLibroConEjemplares(
    volumen: VolumenGoogleBooks,
    cantidad: number,
    ubicacion: string,
  ): Promise<boolean> {
    if (cantidad <= 0) {
      throw new Error('La cantidad debe ser mayor a cero.');
    }

    const isbn =
      volumen.industryIdentifiers?.find(
        (identificador) => identificador.type === 'ISBN_13',
      )?.identifier ??
      volumen.industryIdentifiers?.find(
        (identificador) => identificador.type === 'ISBN_10',
      )?.identifier;

    if (!isbn) {
      throw new Error('El libro no tiene un ISBN.');
    }

    const libros = await this.obtenerLibros();
    const libroExistente = libros.some((libro) => libro.isbn === isbn);

    if (libroExistente) {
      return false;
    }

    const nuevoLibro: Libro = {
      id: crypto.randomUUID(),
      isbn,
      titulo: volumen.title,
      autores: volumen.authors ?? [],
      categorias: volumen.categories ?? [],
      cantidadTotal: cantidad,
      cantidadDisponible: cantidad,
      activo: true,
      imagenPortada: volumen.imageLinks?.thumbnail,
      descripcion: volumen.description,
    };

    const libroGuardado = await this._storageService.guardar<Libro>(
      'libros',
      nuevoLibro,
    );

    if (!libroGuardado) {
      return false;
    }

    const ejemplaresCreados = await this._ejemplarService.crearEjemplaresParaLibro(
      nuevoLibro.id,
      cantidad,
      ubicacion,
    );

    if (ejemplaresCreados.length !== cantidad) {
      await this._ejemplarService.eliminarEjemplaresPorLibro(nuevoLibro.id);
      await this.eliminarLibro(nuevoLibro.id);
      return false;
    }

    return true;
  }
}
