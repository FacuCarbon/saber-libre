import { Injectable, inject } from '@angular/core';

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
   * Actualiza un libro.
   * @param libro El libro a actualizar.
   * @returns true si el libro se actualizó correctamente, false en caso contrario.
   */
  actualizarLibro(libro: Libro): Promise<boolean> {
    return this._storageService.actualizar<Libro>('libros', libro);
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
      imagenPortada: volumen.imageLinks?.thumbnail,
      descripcion: volumen.description,
    };

    return this._storageService.guardar<Libro>('libros', nuevoLibro);
  }
}
