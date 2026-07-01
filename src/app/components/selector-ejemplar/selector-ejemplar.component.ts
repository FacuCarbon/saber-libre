import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { IonButton, IonIcon, IonSpinner } from '@ionic/angular/standalone';

import { BuscadorLibrosComponent } from 'src/app/components/buscador-libros/buscador-libros.component';
import { Ejemplar, Libro, Prestamo, Usuario } from 'src/app/models';
import { EjemplarService } from 'src/app/services/ejemplar.service';
import { LibroService } from 'src/app/services/libro.service';
import { MultaService } from 'src/app/services/multa.service';
import { PerfilUsuarioService } from 'src/app/services/perfil-usuario.service';
import { PrestamoService } from 'src/app/services/prestamo.service';

export type ModoSelectorEjemplar = 'disponible' | 'prestado' | 'vencido';

export interface EjemplarElegido {
  ejemplar: Ejemplar;
  prestamo: Prestamo | null;
}

interface FilaEjemplar {
  ejemplar: Ejemplar;
  prestamo: Prestamo | null;
  lector: Usuario | null;
}

@Component({
  selector: 'app-selector-ejemplar',
  templateUrl: './selector-ejemplar.component.html',
  styleUrls: ['./selector-ejemplar.component.scss'],
  standalone: true,
  imports: [BuscadorLibrosComponent, IonButton, IonIcon, IonSpinner],
})
export class SelectorEjemplarComponent {
  private _libroService = inject(LibroService);
  private _ejemplarService = inject(EjemplarService);
  private _prestamoService = inject(PrestamoService);
  private _perfilUsuarioService = inject(PerfilUsuarioService);
  private _multaService = inject(MultaService);

  @Input({ required: true }) modo!: ModoSelectorEjemplar;

  @Output() ejemplarElegido = new EventEmitter<EjemplarElegido>();

  busquedaRealizada = false;
  buscando = false;
  librosEncontrados: Libro[] = [];

  libroElegido: Libro | null = null;
  cargandoEjemplares = false;
  filas: FilaEjemplar[] = [];

  async buscarLibros(query: string): Promise<void> {
    this.busquedaRealizada = true;
    this.libroElegido = null;
    this.filas = [];

    if (!query.trim()) {
      this.librosEncontrados = [];
      return;
    }

    this.buscando = true;

    try {
      this.librosEncontrados = await this._libroService.buscarLibro(query);
    } catch (error) {
      console.error(error);
      this.librosEncontrados = [];
    } finally {
      this.buscando = false;
    }
  }

  async elegirLibro(libro: Libro): Promise<void> {
    this.libroElegido = libro;
    this.cargandoEjemplares = true;
    this.filas = [];

    try {
      this.filas = await this.cargarFilasSegunModo(libro.id);
    } catch (error) {
      console.error(error);
    } finally {
      this.cargandoEjemplares = false;
    }
  }

  volverABusqueda(): void {
    this.libroElegido = null;
    this.filas = [];
  }

  elegirEjemplar(fila: FilaEjemplar): void {
    this.ejemplarElegido.emit({
      ejemplar: fila.ejemplar,
      prestamo: fila.prestamo,
    });
  }

  formatearFecha(fecha: string): string {
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(fecha));
  }

  private async cargarFilasSegunModo(idLibro: string): Promise<FilaEjemplar[]> {
    if (this.modo === 'disponible') {
      const ejemplares =
        await this._ejemplarService.obtenerEjemplaresDisponiblesPorLibro(
          idLibro,
        );
      return ejemplares.map((ejemplar) => ({
        ejemplar,
        prestamo: null,
        lector: null,
      }));
    }

    const ejemplaresPrestados =
      await this._ejemplarService.obtenerEjemplaresPrestadosPorLibro(idLibro);
    const mapaPrestamos =
      await this._prestamoService.obtenerPrestamosActivosPorEjemplares(
        ejemplaresPrestados.map((ejemplar) => ejemplar.id),
      );

    const filas = await Promise.all(
      ejemplaresPrestados.map(async (ejemplar) => {
        const prestamo = mapaPrestamos.get(ejemplar.id) ?? null;
        const lector = prestamo
          ? await this._perfilUsuarioService.obtenerPerfil(prestamo.idUsuario)
          : null;
        return { ejemplar, prestamo, lector };
      }),
    );

    if (this.modo === 'prestado') {
      return filas.filter((fila) => fila.prestamo !== null);
    }

    const ahora = new Date();
    const filasVencidas = filas.filter(
      (fila) =>
        fila.prestamo && new Date(fila.prestamo.fechaDevEstimada) < ahora,
    );

    const sinMulta = await Promise.all(
      filasVencidas.map(async (fila) => {
        const multa = await this._multaService.obtenerMultaPorPrestamo(
          fila.prestamo!.id,
        );
        return multa ? null : fila;
      }),
    );

    return sinMulta.filter((fila): fila is FilaEjemplar => fila !== null);
  }
}
