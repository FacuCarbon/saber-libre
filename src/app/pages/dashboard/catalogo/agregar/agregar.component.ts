import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonButton, IonIcon, IonInput } from '@ionic/angular/standalone';
import { GoBackComponent } from 'src/app/components/botones/go-back/go-back.component';

import { HeaderPageComponent } from 'src/app/components/dashboard/header-page/header-page.component';
import { VolumenGoogleBooks } from 'src/app/models/google-books.model';
import { LibroService } from 'src/app/services/libro.service';

@Component({
  selector: 'app-agregar',
  templateUrl: './agregar.component.html',
  styleUrls: ['./agregar.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonButton,
    IonIcon,
    IonInput,
    HeaderPageComponent,
    GoBackComponent,
  ],
})
export class AgregarComponent {
  private _libroService = inject(LibroService);

  isbnBusqueda = '';
  tituloBusqueda = '';
  cantidad = 1;
  ubicacion = '';
  resultados: VolumenGoogleBooks[] = [];
  libroSeleccionado: VolumenGoogleBooks | null = null;
  mensaje = '';

  async buscarPorIsbn(): Promise<void> {
    if (!this.isbnBusqueda.trim()) {
      this.mensaje = 'Ingresá un ISBN.';
      return;
    }

    this.mensaje = '';
    this.resultados = [];
    this.libroSeleccionado = null;

    try {
      const resultado = await this._libroService.buscarPorIsbn(
        this.isbnBusqueda.trim(),
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
    if (!this.tituloBusqueda.trim()) {
      this.mensaje = 'Ingresá un título.';
      return;
    }

    this.mensaje = '';
    this.resultados = [];
    this.libroSeleccionado = null;

    try {
      this.resultados = await this._libroService.buscarPorTitulo(
        this.tituloBusqueda.trim(),
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
    if (this.cantidad <= 0) {
      this.mensaje = 'La cantidad debe ser mayor a cero.';
      return;
    }

    if (!this.ubicacion.trim()) {
      this.mensaje = 'Ingresá la ubicación de los ejemplares.';
      return;
    }

    try {
      const guardado = await this._libroService.guardarLibroConEjemplares(
        volumen,
        this.cantidad,
        this.ubicacion.trim(),
      );

      if (!guardado) {
        this.mensaje = 'El libro ya está guardado.';
        return;
      }

      this.mensaje = 'Libro y ejemplares guardados correctamente.';
      this.libroSeleccionado = null;
      this.resultados = [];
      this.cantidad = 1;
      this.ubicacion = '';
    } catch (error) {
      console.error(error);
      this.mensaje = 'No se pudo guardar el libro.';
    }
  }

  obtenerIsbn(volumen: VolumenGoogleBooks): string {
    return (
      volumen.industryIdentifiers?.find(
        (identificador) => identificador.type === 'ISBN_13',
      )?.identifier ??
      volumen.industryIdentifiers?.find(
        (identificador) => identificador.type === 'ISBN_10',
      )?.identifier ??
      'Sin ISBN'
    );
  }
}
