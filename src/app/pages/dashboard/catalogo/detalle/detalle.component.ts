import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { GoBackComponent } from 'src/app/components/botones/go-back/go-back.component';
import { HeaderPageComponent } from 'src/app/components/dashboard/header-page/header-page.component';
import { Ejemplar, Libro } from 'src/app/models';
import { EjemplarService } from 'src/app/services/ejemplar.service';
import { LibroService } from 'src/app/services/libro.service';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.component.html',
  styleUrls: ['./detalle.component.scss'],
  standalone: true,
  imports: [
    GoBackComponent,
    HeaderPageComponent,
    IonButton,
    IonIcon,
  ],
})
export class DetalleComponent implements OnInit {
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _libroService = inject(LibroService);
  private _ejemplarService = inject(EjemplarService);

  idLibro: string | null = this._route.snapshot.paramMap.get('id');
  libroActual: Libro | null = null;
  ejemplares: Ejemplar[] = [];

  cargando = true;
  procesando = false;
  mensaje = '';
  mensajeEsError = false;

  get cantidadTotal(): number {
    return this.ejemplares.filter(
      (ejemplar) => ejemplar.estadoEjemplar !== 'baja',
    ).length;
  }

  get cantidadDisponible(): number {
    return this.ejemplares.filter(
      (ejemplar) => ejemplar.estadoEjemplar === 'disponible',
    ).length;
  }

  get cantidadPrestada(): number {
    return this.ejemplares.filter(
      (ejemplar) => ejemplar.estadoEjemplar === 'prestado',
    ).length;
  }

  get cantidadMantenimiento(): number {
    return this.ejemplares.filter(
      (ejemplar) => ejemplar.estadoEjemplar === 'mantenimiento',
    ).length;
  }

  get cantidadBaja(): number {
    return this.ejemplares.filter(
      (ejemplar) => ejemplar.estadoEjemplar === 'baja',
    ).length;
  }

  async ngOnInit(): Promise<void> {
    if (!this.idLibro) {
      this.mensaje = 'No se encontró el libro.';
      this.mensajeEsError = true;
      this.cargando = false;
      return;
    }

    await this.cargarDatos();
  }

  editarLibro(): void {
    if (!this.idLibro) {
      return;
    }

    this._router.navigate(['/dashboard/catalogo/editar', this.idLibro]);
  }

  gestionarEjemplares(): void {
    if (!this.idLibro) {
      return;
    }

    this._router.navigate(['/dashboard/catalogo', this.idLibro, 'ejemplares']);
  }

  async cambiarEstadoLibro(): Promise<void> {
    if (!this.idLibro || !this.libroActual || this.procesando) {
      return;
    }

    this.procesando = true;

    try {
      const actualizado =
        this.libroActual.activo === false
          ? await this._libroService.reactivarLibro(this.idLibro)
          : await this._libroService.darDeBajaLibro(this.idLibro);

      if (!actualizado) {
        this.mostrarMensaje(
          this.libroActual.activo === false
            ? 'No se pudo reactivar el libro.'
            : 'No se pudo dar de baja el libro.',
          true,
        );
        return;
      }

      await this.cargarDatos(false);
      this.mostrarMensaje(
        this.libroActual?.activo === false
          ? 'El libro se dio de baja correctamente.'
          : 'El libro se reactivó correctamente.',
      );
    } catch (error) {
      console.error(error);
      this.mostrarMensaje(
        this.libroActual.activo === false
          ? 'No se pudo reactivar el libro.'
          : 'No se pudo dar de baja el libro.',
        true,
      );
    } finally {
      this.procesando = false;
    }
  }

  obtenerTextoEstadoLibro(): string {
    return this.libroActual?.activo === false ? 'Dado de baja' : 'Activo';
  }

  obtenerTextoEstadoEjemplar(estado: Ejemplar['estadoEjemplar']): string {
    const textos: Record<Ejemplar['estadoEjemplar'], string> = {
      disponible: 'Disponible',
      prestado: 'Prestado',
      mantenimiento: 'Mantenimiento',
      baja: 'Baja',
    };

    return textos[estado];
  }

  private async cargarDatos(reiniciarMensaje = true): Promise<void> {
    if (!this.idLibro) {
      return;
    }

    if (reiniciarMensaje) {
      this.mensaje = '';
      this.mensajeEsError = false;
    }

    this.cargando = true;

    try {
      this.libroActual = await this._libroService.obtenerLibroPorId(this.idLibro);

      if (!this.libroActual) {
        this.mensaje = 'No se encontró el libro.';
        this.mensajeEsError = true;
        this.ejemplares = [];
        return;
      }

      this.ejemplares =
        await this._ejemplarService.obtenerEjemplaresPorLibro(this.idLibro);
    } catch (error) {
      console.error(error);
      this.libroActual = null;
      this.ejemplares = [];
      this.mensaje = 'No se pudo cargar la información del libro.';
      this.mensajeEsError = true;
    } finally {
      this.cargando = false;
    }
  }

  private mostrarMensaje(mensaje: string, esError = false): void {
    this.mensaje = mensaje;
    this.mensajeEsError = esError;
  }
}
