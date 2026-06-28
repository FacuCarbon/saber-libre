import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Libro } from '../../../models/libro.model';
import { VolumenGoogleBooks } from '../../../models/google-books.model';
import { LibroService } from '../../../services/libro.service';

@Component({
  selector: 'app-gestion',
  templateUrl: './gestion.page.html',
  styleUrls: ['./gestion.page.scss'],
  standalone: true,
  imports: [FormsModule],
})
export class GestionPage implements OnInit {
  private _libroService = inject(LibroService);

  isbnBusqueda = '';
  tituloBusqueda = '';
  cantidad = 1;

  resultados: VolumenGoogleBooks[] = [];
  libroSeleccionado: VolumenGoogleBooks | null = null;
  librosGuardados: Libro[] = [];

  mensaje = '';

  async ngOnInit(): Promise<void> {
    await this.cargarLibros();
  }

  async buscarPorIsbn(): Promise<void> {
    this.mensaje = '';
    this.resultados = [];
    this.libroSeleccionado = null;

    try {
      const resultado = await this._libroService.buscarPorIsbn(
        this.isbnBusqueda,
      );

      if (!resultado) {
        this.mensaje = 'No se encontró el libro.';
        return;
      }

      this.libroSeleccionado = resultado;
    } catch (error) {
      console.error(error);
      this.mensaje = 'Error al buscar por ISBN.';
    }
  }

  async buscarPorTitulo(): Promise<void> {
    this.mensaje = '';
    this.resultados = [];
    this.libroSeleccionado = null;

    try {
      this.resultados = await this._libroService.buscarPorTitulo(
        this.tituloBusqueda,
      );

      if (this.resultados.length === 0) {
        this.mensaje = 'No se encontraron libros.';
      }
    } catch (error) {
      console.error(error);
      this.mensaje = 'Error al buscar por título.';
    }
  }

  seleccionarLibro(volumen: VolumenGoogleBooks): void {
    this.libroSeleccionado = volumen;
    this.resultados = [];
    this.mensaje = '';
  }

  async guardarLibro(volumen: VolumenGoogleBooks): Promise<void> {
    try {
      const guardado = await this._libroService.guardarLibro(
        volumen,
        this.cantidad,
      );

      if (!guardado) {
        this.mensaje = 'El libro ya está guardado.';
        return;
      }

      this.mensaje = 'Libro guardado correctamente.';
      this.libroSeleccionado = null;
      this.resultados = [];
      this.cantidad = 1;

      await this.cargarLibros();
    } catch (error) {
      console.error(error);
      this.mensaje = 'No se pudo guardar el libro.';
    }
  }

  async cargarLibros(): Promise<void> {
    try {
      this.librosGuardados = await this._libroService.obtenerLibros();
    } catch (error) {
      console.error(error);
      this.mensaje = 'No se pudieron cargar los libros guardados.';
    }
  }
}
