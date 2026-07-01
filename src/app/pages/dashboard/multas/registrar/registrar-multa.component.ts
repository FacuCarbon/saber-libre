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
import {
  EjemplarElegido,
  SelectorEjemplarComponent,
} from 'src/app/components/selector-ejemplar/selector-ejemplar.component';
import { Ejemplar, Libro, Prestamo, Usuario } from 'src/app/models';
import { BarcodeService } from 'src/app/services/barcode.service';
import { EjemplarService } from 'src/app/services/ejemplar.service';
import { LibroService } from 'src/app/services/libro.service';
import { MultaService } from 'src/app/services/multa.service';
import { PerfilUsuarioService } from 'src/app/services/perfil-usuario.service';
import { PrestamoService } from 'src/app/services/prestamo.service';

@Component({
  selector: 'app-registrar-multa',
  templateUrl: './registrar-multa.component.html',
  styleUrls: ['./registrar-multa.component.scss'],
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
    SelectorEjemplarComponent,
  ],
})
export class RegistrarMultaComponent implements OnInit {
  private _route = inject(ActivatedRoute);
  private _barcodeService = inject(BarcodeService);
  private _ejemplarService = inject(EjemplarService);
  private _libroService = inject(LibroService);
  private _perfilUsuarioService = inject(PerfilUsuarioService);
  private _prestamoService = inject(PrestamoService);
  private _multaService = inject(MultaService);

  codigoBarras = '';
  monto: number | null = null;
  ejemplarSeleccionado: Ejemplar | null = null;
  libroSeleccionado: Libro | null = null;
  prestamoSeleccionado: Prestamo | null = null;
  lectorSeleccionado: Usuario | null = null;

  mostrarSelector = false;
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
    await this.buscarMulta();
  }

  async buscarMulta(): Promise<void> {
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

      await this.procesarEjemplarEncontrado(ejemplar);
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

  async elegirEjemplarDesdeSelector(seleccion: EjemplarElegido): Promise<void> {
    this.codigoBarras = seleccion.ejemplar.codigoBarras;
    this.limpiarSeleccion();
    this.mensaje = '';

    try {
      await this.procesarEjemplarEncontrado(
        seleccion.ejemplar,
        seleccion.prestamo,
      );
    } catch (error) {
      console.error(error);
      this.mostrarMensaje('No se pudo cargar el préstamo elegido.', true);
    }
  }

  private async procesarEjemplarEncontrado(
    ejemplar: Ejemplar,
    prestamoConocido?: Prestamo | null,
  ): Promise<void> {
    const prestamo =
      prestamoConocido !== undefined
        ? prestamoConocido
        : await this._prestamoService.obtenerPrestamoActivoPorEjemplar(
            ejemplar.id,
          );

    if (!prestamo) {
      this.mostrarMensaje('El ejemplar no tiene un préstamo activo.', true);
      return;
    }

    if (new Date(prestamo.fechaDevEstimada) >= new Date()) {
      this.mostrarMensaje(
        'El préstamo no está vencido, no corresponde generar una multa.',
        true,
      );
      return;
    }

    const multaExistente = await this._multaService.obtenerMultaPorPrestamo(
      prestamo.id,
    );

    if (multaExistente) {
      this.mostrarMensaje('Este préstamo ya tiene una multa registrada.', true);
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

    this.mostrarMensaje(
      'Préstamo vencido encontrado. Revisá los datos y completá el monto.',
      false,
    );
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
      await this.buscarMulta();
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

  async confirmarRegistro(): Promise<void> {
    if (!this.prestamoSeleccionado || this.procesando) {
      return;
    }

    if (!this.monto || this.monto <= 0) {
      this.mostrarMensaje('Ingresá un monto válido para la multa.', true);
      return;
    }

    this.procesando = true;
    this.mensaje = '';

    try {
      const multa = await this._multaService.crearMulta(
        this.prestamoSeleccionado.idUsuario,
        this.prestamoSeleccionado.id,
        this.monto,
      );

      if (!multa) {
        this.mostrarMensaje(
          'No se pudo registrar la multa. El préstamo pudo haber sido actualizado.',
          true,
        );
        return;
      }

      this.codigoBarras = '';
      this.monto = null;
      this.limpiarSeleccion();
      this.mostrarMensaje('Multa registrada correctamente.', false);
    } catch (error) {
      console.error(error);
      this.mostrarMensaje(
        error instanceof Error
          ? error.message
          : 'No se pudo registrar la multa.',
        true,
      );
    } finally {
      this.procesando = false;
    }
  }

  get escanerDisponible(): boolean {
    return this._barcodeService.esAndroidNativo();
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
    this.monto = null;
  }

  private mostrarMensaje(mensaje: string, esError: boolean): void {
    this.mensaje = mensaje;
    this.mensajeEsError = esError;
  }
}
