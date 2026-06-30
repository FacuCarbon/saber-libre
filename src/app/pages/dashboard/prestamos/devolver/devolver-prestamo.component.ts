import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  IonButton,
  IonIcon,
  IonInput,
  IonLabel,
} from '@ionic/angular/standalone';

import { GoBackComponent } from 'src/app/components/botones/go-back/go-back.component';
import { HeaderPageComponent } from 'src/app/components/dashboard/header-page/header-page.component';
import { Ejemplar, Libro, Prestamo, Usuario } from 'src/app/models';
import { BarcodeService } from 'src/app/services/barcode.service';
import { EjemplarService } from 'src/app/services/ejemplar.service';
import { LibroService } from 'src/app/services/libro.service';
import { PerfilUsuarioService } from 'src/app/services/perfil-usuario.service';
import { PrestamoService } from 'src/app/services/prestamo.service';

@Component({
  selector: 'app-devolver-prestamo',
  templateUrl: './devolver-prestamo.component.html',
  styleUrls: ['./devolver-prestamo.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonButton,
    IonIcon,
    IonInput,
    IonLabel,
    RouterLink,
    GoBackComponent,
    HeaderPageComponent,
  ],
})
export class DevolverPrestamoComponent implements OnInit {
  private _route = inject(ActivatedRoute);
  private _barcodeService = inject(BarcodeService);
  private _ejemplarService = inject(EjemplarService);
  private _libroService = inject(LibroService);
  private _perfilUsuarioService = inject(PerfilUsuarioService);
  private _prestamoService = inject(PrestamoService);

  codigoBarras = '';
  ejemplarSeleccionado: Ejemplar | null = null;
  libroSeleccionado: Libro | null = null;
  prestamoSeleccionado: Prestamo | null = null;
  lectorSeleccionado: Usuario | null = null;

  buscando = false;
  escaneando = false;
  procesando = false;
  mensaje = '';
  mensajeEsError = false;

  async ngOnInit(): Promise<void> {
    const codigo = this._route.snapshot.queryParamMap.get('codigo');
    if (!codigo) {
      return;
    }

    this.codigoBarras = codigo;
    await this.buscarPrestamo();
  }

  async buscarPrestamo(): Promise<void> {
    const codigo = this.codigoBarras.trim();
    if (!codigo || this.buscando) {
      this.mostrarMensaje('Ingresá el código de barras del ejemplar.', true);
      return;
    }

    this.buscando = true;
    this.limpiarSeleccion();
    this.mensaje = '';

    try {
      const ejemplar =
        await this._ejemplarService.obtenerEjemplarPorCodigoBarras(codigo);

      if (!ejemplar) {
        this.mostrarMensaje('No se encontró un ejemplar con ese código.', true);
        return;
      }

      const prestamo =
        await this._prestamoService.obtenerPrestamoActivoPorEjemplar(
          ejemplar.id,
        );

      if (!prestamo) {
        this.mostrarMensaje(
          'El ejemplar no tiene un préstamo activo para devolver.',
          true,
        );
        return;
      }

      const [libro, lector] = await Promise.all([
        this._libroService.obtenerLibroPorId(ejemplar.idLibro),
        this._perfilUsuarioService.obtenerPerfil(prestamo.idUsuario),
      ]);

      this.ejemplarSeleccionado = ejemplar;
      this.prestamoSeleccionado = prestamo;
      this.libroSeleccionado = libro;
      this.lectorSeleccionado = lector;

      this.mostrarMensaje('Préstamo encontrado. Revisá los datos.', false);
    } catch (error) {
      console.error(error);
      this.mostrarMensaje('No se pudo buscar el préstamo.', true);
    } finally {
      this.buscando = false;
    }
  }

  cambiarCodigoBarras(): void {
    this.limpiarSeleccion();
    this.mensaje = '';
  }

  async escanearCodigo(): Promise<void> {
    if (this.escaneando) {
      return;
    }

    this.escaneando = true;
    this.mensaje = '';

    try {
      const codigo = await this._barcodeService.escanearCodigo();
      if (!codigo) {
        return;
      }

      this.codigoBarras = codigo;
      await this.buscarPrestamo();
    } catch (error) {
      console.error(error);
      this.mostrarMensaje(
        error instanceof Error ? error.message : 'No se pudo abrir el escáner.',
        true,
      );
    } finally {
      this.escaneando = false;
    }
  }

  async confirmarDevolucion(): Promise<void> {
    if (!this.prestamoSeleccionado || this.procesando) {
      return;
    }

    this.procesando = true;
    this.mensaje = '';

    try {
      const devuelto = await this._prestamoService.registrarDevolucion(
        this.prestamoSeleccionado.id,
      );

      if (!devuelto) {
        this.mostrarMensaje(
          'No se pudo registrar la devolución. El préstamo pudo haber sido actualizado.',
          true,
        );
        return;
      }

      this.codigoBarras = '';
      this.limpiarSeleccion();
      this.mostrarMensaje('Devolución registrada correctamente.', false);
    } catch (error) {
      console.error(error);
      this.mostrarMensaje(
        error instanceof Error
          ? error.message
          : 'No se pudo registrar la devolución.',
        true,
      );
    } finally {
      this.procesando = false;
    }
  }

  get escanerDisponible(): boolean {
    return this._barcodeService.esAndroidNativo();
  }

  get prestamoVencido(): boolean {
    if (!this.prestamoSeleccionado) {
      return false;
    }

    return new Date(this.prestamoSeleccionado.fechaDevEstimada) < new Date();
  }

  formatearFecha(fecha: string): string {
    return new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(fecha));
  }

  private limpiarSeleccion(): void {
    this.ejemplarSeleccionado = null;
    this.libroSeleccionado = null;
    this.prestamoSeleccionado = null;
    this.lectorSeleccionado = null;
  }

  private mostrarMensaje(mensaje: string, esError: boolean): void {
    this.mensaje = mensaje;
    this.mensajeEsError = esError;
  }
}
