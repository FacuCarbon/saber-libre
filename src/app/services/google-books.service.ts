import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  RespuestaGoogleBooks,
  VolumenGoogleBooks,
} from '../models/google-books.model';

@Injectable({
  providedIn: 'root',
})
export class GoogleBooksService {
  private _http = inject(HttpClient);

  private _urlApi = 'https://www.googleapis.com/books/v1/volumes';

  /**
   * Busca un libro por su ISBN.
   * @param isbn El ISBN del libro a buscar.
   * @returns El libro encontrado o null si no se encuentra.
   */
  async buscarPorIsbn(isbn: string): Promise<VolumenGoogleBooks | null> {
    const respuesta = await firstValueFrom(
      this._http.get<RespuestaGoogleBooks>(this._urlApi, {
        params: {
          q: `isbn:${isbn}`,
          key: environment.googleBooksApiKey,
        },
      }),
    );

    const volumen = respuesta.items?.[0]?.volumeInfo;
    return volumen ? this.normalizarVolumen(volumen) : null;
  }

  /**
   * Busca libros por su título.
   * @param titulo El título del libro a buscar.
   * @returns Una lista de libros encontrados.
   */
  async buscarPorTitulo(titulo: string): Promise<VolumenGoogleBooks[]> {
    const respuesta = await firstValueFrom(
      this._http.get<RespuestaGoogleBooks>(this._urlApi, {
        params: {
          q: `intitle:${titulo}`,
          key: environment.googleBooksApiKey,
        },
      }),
    );

    return (respuesta.items ?? []).map((item) =>
      this.normalizarVolumen(item.volumeInfo),
    );
  }

  private normalizarVolumen(volumen: VolumenGoogleBooks): VolumenGoogleBooks {
    if (!volumen.imageLinks) {
      return volumen;
    }

    return {
      ...volumen,
      imageLinks: {
        ...volumen.imageLinks,
        thumbnail: this.normalizarUrlImagen(volumen.imageLinks.thumbnail),
      },
    };
  }

  private normalizarUrlImagen(url: string | undefined): string | undefined {
    return url?.replace(/^http:\/\//i, 'https://');
  }
}
