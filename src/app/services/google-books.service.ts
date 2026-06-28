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

    return respuesta.items?.[0]?.volumeInfo ?? null;
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

    return (respuesta.items ?? []).map((item) => item.volumeInfo);
  }
}
