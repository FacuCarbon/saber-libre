import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonButton,
  IonIcon,
  IonInput,
  IonLabel,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';
import { GoBackComponent } from 'src/app/components/botones/go-back/go-back.component';
import { HeaderPageComponent } from 'src/app/components/dashboard/header-page/header-page.component';
import { Ejemplar, EstadoEjemplar, Libro } from 'src/app/models';
import { EjemplarService } from 'src/app/services/ejemplar.service';
import { LibroService } from 'src/app/services/libro.service';

@Component({
  selector: 'app-ejemplares',
  templateUrl: './ejemplares.component.html',
  styleUrls: ['./ejemplares.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonButton,
    IonIcon,
    IonInput,
    IonLabel,
    IonSelect,
    IonSelectOption,
    GoBackComponent,
    HeaderPageComponent,
  ],
})
export class EjemplaresComponent implements OnInit {
  private _route = inject(ActivatedRoute);
  private _libroService = inject(LibroService);
  private _ejemplarService = inject(EjemplarService);

  idLibro: string | null = this._route.snapshot.paramMap.get('id');
  libroActual: Libro | null = null;
  ejemplares: Ejemplar[] = [];

  mostrarFormularioAlta = false;
  cantidad = 1;
  ubicacion = '';

  ejemplarSeleccionado: Ejemplar | null = null;
  ubicacionEdicion = '';
  estadoEdicion: EstadoEjemplar = 'disponible';

  ejemplarParaBaja: Ejemplar | null = null;
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
      this.mostrarMensaje('No se encontró el libro.', true);
      return;
    }

    try {
      this.libroActual = await this._libroService.obtenerLibroPorId(
        this.idLibro,
      );

      if (!this.libroActual) {
        this.mostrarMensaje('No se encontró el libro.', true);
        return;
      }

      await this.cargarEjemplares();
    } catch (error) {
      console.error(error);
      this.mostrarMensaje('No se pudieron cargar los ejemplares.', true);
    }
  }

  abrirFormularioAlta(): void {
    if (this.libroActual?.activo === false) {
      this.mostrarMensaje(
        'Reactivá el libro antes de agregar ejemplares.',
        true,
      );
      return;
    }

    this.mostrarFormularioAlta = true;
    this.ejemplarSeleccionado = null;
    this.ejemplarParaBaja = null;
    this.mensaje = '';
  }

  cancelarAlta(): void {
    this.mostrarFormularioAlta = false;
    this.cantidad = 1;
    this.ubicacion = '';
  }

  async agregarEjemplares(): Promise<void> {
    if (!this.idLibro || this.procesando) {
      return;
    }

    if (!Number.isInteger(this.cantidad) || this.cantidad <= 0) {
      this.mostrarMensaje('La cantidad debe ser un entero mayor a cero.', true);
      return;
    }

    const ubicacion = this.ubicacion.trim();

    if (!ubicacion) {
      this.mostrarMensaje('Ingresá la ubicación de los ejemplares.', true);
      return;
    }

    this.procesando = true;

    try {
      const creados = await this._ejemplarService.crearEjemplaresParaLibro(
        this.idLibro,
        this.cantidad,
        ubicacion,
      );

      if (creados.length === 0) {
        this.mostrarMensaje('No se pudieron crear los ejemplares.', true);
        return;
      }

      await this._libroService.sincronizarCantidadesDesdeEjemplares(
        this.idLibro,
      );
      await this.cargarEjemplares();

      if (creados.length !== this.cantidad) {
        this.mostrarMensaje(
          `Se crearon ${creados.length} de ${this.cantidad} ejemplares.`,
          true,
        );
      } else {
        this.mostrarMensaje('Los ejemplares se agregaron correctamente.');
      }

      this.cancelarAlta();
    } catch (error) {
      console.error(error);
      this.mostrarMensaje('No se pudieron crear los ejemplares.', true);
    } finally {
      this.procesando = false;
    }
  }

  editarEjemplar(ejemplar: Ejemplar): void {
    if (this.libroActual?.activo === false) {
      this.mostrarMensaje(
        'Reactivá el libro antes de editar sus ejemplares.',
        true,
      );
      return;
    }

    if (
      ejemplar.estadoEjemplar === 'prestado' ||
      ejemplar.estadoEjemplar === 'baja'
    ) {
      this.mostrarMensaje(
        'Ese ejemplar no se puede editar desde esta pantalla.',
        true,
      );
      return;
    }

    this.ejemplarSeleccionado = ejemplar;
    this.ubicacionEdicion = ejemplar.ubicacion;
    this.estadoEdicion = ejemplar.estadoEjemplar;
    this.mostrarFormularioAlta = false;
    this.ejemplarParaBaja = null;
    this.mensaje = '';
  }

  cancelarEdicion(): void {
    this.ejemplarSeleccionado = null;
    this.ubicacionEdicion = '';
    this.estadoEdicion = 'disponible';
  }

  async guardarEjemplar(): Promise<void> {
    if (!this.ejemplarSeleccionado || !this.idLibro || this.procesando) {
      return;
    }

    const ubicacion = this.ubicacionEdicion.trim();

    if (!ubicacion) {
      this.mostrarMensaje('Ingresá la ubicación del ejemplar.', true);
      return;
    }

    const ejemplarActualizado: Ejemplar = {
      ...this.ejemplarSeleccionado,
      ubicacion,
      estadoEjemplar: this.estadoEdicion,
    };

    this.procesando = true;

    try {
      const actualizado =
        await this._ejemplarService.actualizarEjemplar(ejemplarActualizado);

      if (!actualizado) {
        this.mostrarMensaje('No se pudo actualizar el ejemplar.', true);
        return;
      }

      await this._libroService.sincronizarCantidadesDesdeEjemplares(
        this.idLibro,
      );
      await this.cargarEjemplares();
      this.cancelarEdicion();
      this.mostrarMensaje('El ejemplar se actualizó correctamente.');
    } catch (error) {
      console.error(error);
      this.mostrarMensaje('No se pudo actualizar el ejemplar.', true);
    } finally {
      this.procesando = false;
    }
  }

  solicitarBaja(ejemplar: Ejemplar): void {
    if (this.libroActual?.activo === false) {
      this.mostrarMensaje(
        'Reactivá el libro antes de modificar sus ejemplares.',
        true,
      );
      return;
    }

    if (ejemplar.estadoEjemplar === 'prestado') {
      this.mostrarMensaje(
        'No se puede dar de baja un ejemplar prestado.',
        true,
      );
      return;
    }

    this.ejemplarParaBaja = ejemplar;
    this.ejemplarSeleccionado = null;
    this.mostrarFormularioAlta = false;
    this.mensaje = '';
  }

  cancelarBaja(): void {
    this.ejemplarParaBaja = null;
  }

  async darDeBaja(): Promise<void> {
    if (!this.ejemplarParaBaja || !this.idLibro || this.procesando) {
      return;
    }

    const ejemplarActualizado: Ejemplar = {
      ...this.ejemplarParaBaja,
      estadoEjemplar: 'baja',
    };

    this.procesando = true;

    try {
      const actualizado =
        await this._ejemplarService.actualizarEjemplar(ejemplarActualizado);

      if (!actualizado) {
        this.mostrarMensaje('No se pudo dar de baja el ejemplar.', true);
        return;
      }

      await this._libroService.sincronizarCantidadesDesdeEjemplares(
        this.idLibro,
      );
      await this.cargarEjemplares();
      this.cancelarBaja();
      this.mostrarMensaje('El ejemplar se dio de baja correctamente.');
    } catch (error) {
      console.error(error);
      this.mostrarMensaje('No se pudo dar de baja el ejemplar.', true);
    } finally {
      this.procesando = false;
    }
  }

  async reactivarEjemplar(ejemplar: Ejemplar): Promise<void> {
    if (!this.idLibro || this.libroActual?.activo === false || this.procesando) {
      return;
    }

    const ejemplarActualizado: Ejemplar = {
      ...ejemplar,
      estadoEjemplar: 'disponible',
    };

    this.procesando = true;

    try {
      const actualizado =
        await this._ejemplarService.actualizarEjemplar(ejemplarActualizado);

      if (!actualizado) {
        this.mostrarMensaje('No se pudo reactivar el ejemplar.', true);
        return;
      }

      await this._libroService.sincronizarCantidadesDesdeEjemplares(
        this.idLibro,
      );
      await this.cargarEjemplares();
      this.mostrarMensaje('El ejemplar se reactivó como disponible.');
    } catch (error) {
      console.error(error);
      this.mostrarMensaje('No se pudo reactivar el ejemplar.', true);
    } finally {
      this.procesando = false;
    }
  }

  obtenerTextoEstado(estado: EstadoEjemplar): string {
    const textos: Record<EstadoEjemplar, string> = {
      disponible: 'Disponible',
      prestado: 'Prestado',
      mantenimiento: 'Mantenimiento',
      baja: 'Baja',
    };

    return textos[estado];
  }

  private async cargarEjemplares(): Promise<void> {
    if (!this.idLibro) {
      return;
    }

    this.ejemplares =
      await this._ejemplarService.obtenerEjemplaresPorLibro(this.idLibro);
  }

  private mostrarMensaje(mensaje: string, esError = false): void {
    this.mensaje = mensaje;
    this.mensajeEsError = esError;
  }
}
