import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { BuscadorLibrosComponent } from 'src/app/components/buscador-libros/buscador-libros.component';
import { HeaderPageComponent } from 'src/app/components/dashboard/header-page/header-page.component';
import { LibroCatalogoItemComponent } from 'src/app/components/dashboard/libro-catalogo-item/libro-catalogo-item.component';
import { Libro } from 'src/app/models';
import { EjemplarService } from 'src/app/services/ejemplar.service';
import { LibroService } from 'src/app/services/libro.service';

@Component({
  selector: 'app-catalogo',
  templateUrl: './catalogo.page.html',
  styleUrls: ['./catalogo.page.scss'],
  standalone: true,
  imports: [
    BuscadorLibrosComponent,
    HeaderPageComponent,
    LibroCatalogoItemComponent,
    IonButton,
    IonIcon,
  ],
})
export class CatalogoPage implements OnInit {
  private _libroService = inject(LibroService);
  private _ejemplarService = inject(EjemplarService);
  private _router = inject(Router);

  libros: Libro[] = [];
  librosFiltrados: Libro[] = [];
  busquedaActual = '';
  mostrarInactivos = false;
  libroParaBaja: Libro | null = null;
  mensaje = '';
  mensajeEsError = false;

  get cantidadInactivos(): number {
    return this.libros.filter((libro) => libro.activo === false).length;
  }

  async ngOnInit(): Promise<void> {
    await this.cargarLibros();
  }

  filtrarLibros(query: string): void {
    this.busquedaActual = query;
    this.aplicarFiltros();
  }

  alternarLibrosInactivos(): void {
    this.mostrarInactivos = !this.mostrarInactivos;
    this.libroParaBaja = null;
    this.mensaje = '';
    this.aplicarFiltros();
  }

  agregarLibro(): void {
    this._router.navigate(['/dashboard/catalogo/agregar']);
  }

  verLibro(id: string): void {
    this._router.navigate(['/dashboard/catalogo/detalle', id]);
  }

  editarLibro(id: string): void {
    this._router.navigate(['/dashboard/catalogo/editar', id]);
  }

  abrirGestionEjemplares(id: string): void {
    this._router.navigate(['/dashboard/catalogo', id, 'ejemplares']);
  }

  async solicitarBajaLibro(id: string): Promise<void> {
    const libro = this.libros.find((item) => item.id === id);

    if (!libro) {
      this.mostrarMensaje('No se encontró el libro.', true);
      return;
    }

    const ejemplares =
      await this._ejemplarService.obtenerEjemplaresPorLibro(id);
    const tieneEjemplaresPrestados = ejemplares.some(
      (ejemplar) => ejemplar.estadoEjemplar === 'prestado',
    );

    if (tieneEjemplaresPrestados) {
      this.mostrarMensaje(
        'No se puede dar de baja un libro con ejemplares prestados.',
        true,
      );
      return;
    }

    this.libroParaBaja = libro;
    this.mensaje = '';
  }

  cancelarBaja(): void {
    this.libroParaBaja = null;
  }

  async confirmarBaja(): Promise<void> {
    if (!this.libroParaBaja) {
      return;
    }

    try {
      const actualizado = await this._libroService.darDeBajaLibro(
        this.libroParaBaja.id,
      );

      if (!actualizado) {
        this.mostrarMensaje('No se pudo dar de baja el libro.', true);
        return;
      }

      this.libroParaBaja = null;
      await this.cargarLibros();
      this.mostrarMensaje('El libro se dio de baja correctamente.');
    } catch (error) {
      console.error(error);
      this.mostrarMensaje('No se pudo dar de baja el libro.', true);
    }
  }

  async reactivarLibro(id: string): Promise<void> {
    try {
      const actualizado = await this._libroService.reactivarLibro(id);

      if (!actualizado) {
        this.mostrarMensaje('No se pudo reactivar el libro.', true);
        return;
      }

      await this.cargarLibros();
      this.mostrarMensaje('El libro se reactivó correctamente.');
    } catch (error) {
      console.error(error);
      this.mostrarMensaje('No se pudo reactivar el libro.', true);
    }
  }

  private async cargarLibros(): Promise<void> {
    this.libros = await this._libroService.obtenerLibros();
    this.aplicarFiltros();
  }

  private aplicarFiltros(): void {
    const busqueda = this.busquedaActual.toLowerCase().trim();

    this.librosFiltrados = this.libros.filter((libro) => {
      const coincideEstado = this.mostrarInactivos
        ? libro.activo === false
        : libro.activo !== false;

      if (!coincideEstado) {
        return false;
      }

      if (!busqueda) {
        return true;
      }

      const tituloCoincide = libro.titulo
        .toLowerCase()
        .trim()
        .includes(busqueda);
      const isbnCoincide = libro.isbn.toLowerCase().trim().includes(busqueda);
      const autorCoincide = libro.autores.some((autor) =>
        autor.toLowerCase().trim().includes(busqueda),
      );

      return tituloCoincide || isbnCoincide || autorCoincide;
    });
  }

  private mostrarMensaje(mensaje: string, esError = false): void {
    this.mensaje = mensaje;
    this.mensajeEsError = esError;
  }
}
