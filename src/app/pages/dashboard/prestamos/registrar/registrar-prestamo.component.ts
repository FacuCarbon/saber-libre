import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonIcon,
  IonInput,
  IonLabel,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';

import { GoBackComponent } from 'src/app/components/botones/go-back/go-back.component';
import { BannerMoraComponent } from 'src/app/components/banner-mora/banner-mora.component';
import { HeaderPageComponent } from 'src/app/components/dashboard/header-page/header-page.component';
import { SelectorEjemplarComponent } from 'src/app/components/selector-ejemplar/selector-ejemplar.component';
import { Ejemplar, Libro, Usuario } from 'src/app/models';
import { AuthService } from 'src/app/services/auth.service';
import { BarcodeService } from 'src/app/services/barcode.service';
import { EjemplarService } from 'src/app/services/ejemplar.service';
import { LibroService } from 'src/app/services/libro.service';
import { MultaService } from 'src/app/services/multa.service';

import { PrestamoService } from 'src/app/services/prestamo.service';

@Component({
  selector: 'app-registrar-prestamo',
  templateUrl: './registrar-prestamo.component.html',
  styleUrls: ['./registrar-prestamo.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonButton,
    IonIcon,
    IonInput,
    IonLabel,
    IonSelect,
    IonSelectOption,
    RouterLink,
    GoBackComponent,
    BannerMoraComponent,
    HeaderPageComponent,
    SelectorEjemplarComponent,
  ],
})
export class RegistrarPrestamoComponent implements OnInit {
  private _router = inject(Router);
  private _authService = inject(AuthService);
  private _barcodeService = inject(BarcodeService);
  private _ejemplarService = inject(EjemplarService);
  private _libroService = inject(LibroService);
  private _multaService = inject(MultaService);
  private _prestamoService = inject(PrestamoService);

  lectores: Usuario[] = [];
  bibliotecarioActual: Usuario | null = null;
  idUsuario = '';
  codigoBarras = '';
  fechaDevEstimada = '';
  fechaMinima = '';
  mostrarSelector = false;

  ejemplarSeleccionado: Ejemplar | null = null;
  libroSeleccionado: Libro | null = null;
  tieneMultaPendiente = false;

  cargando = true;
  buscando = false;
  escaneando = false;
  guardando = false;
  mensaje = '';
  mensajeEsError = false;

  async ngOnInit(): Promise<void> {
    const hoy = new Date();
    const fechaSugerida = new Date(hoy);
    fechaSugerida.setDate(fechaSugerida.getDate() + 7);

    this.fechaMinima = this.convertirFechaParaInput(hoy);
    this.fechaDevEstimada = this.convertirFechaParaInput(fechaSugerida);

    try {
      const perfiles = await this._authService.obtenerUsuarios();
      this.lectores = perfiles
        .filter((perfil) => perfil.rol === 'lector')
        .sort((a, b) => a.nombreCompleto.localeCompare(b.nombreCompleto));
      this.bibliotecarioActual = await this._authService.usuarioActual();

      if (!this.bibliotecarioActual) {
        this.mostrarMensaje(
          'No se pudo identificar al responsable del préstamo.',
          true,
        );
      }
    } catch (error) {
      console.error(error);
      this.mostrarMensaje('No se pudieron cargar los lectores.', true);
    } finally {
      this.cargando = false;
    }
  }

  async seleccionarLector(): Promise<void> {
    this.tieneMultaPendiente = false;

    if (!this.idUsuario) {
      return;
    }

    try {
      this.tieneMultaPendiente = await this._multaService.tieneMultaPendiente(
        this.idUsuario,
      );
    } catch (error) {
      console.error(error);
      this.mostrarMensaje('No se pudo verificar el estado del lector.', true);
    }
  }

  async buscarEjemplar(): Promise<void> {
    const codigo = this.codigoBarras.trim();
    if (!codigo || this.buscando) {
      this.mostrarMensaje('Ingresá el código de barras del ejemplar.', true);
      return;
    }

    this.buscando = true;
    this.ejemplarSeleccionado = null;
    this.libroSeleccionado = null;
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
      this.mostrarMensaje('No se pudo buscar el ejemplar.', true);
    } finally {
      this.buscando = false;
    }
  }

  cambiarCodigoBarras(): void {
    this.ejemplarSeleccionado = null;
    this.libroSeleccionado = null;
    this.mensaje = '';
  }

  async elegirEjemplarDesdeSelector(ejemplar: Ejemplar): Promise<void> {
    this.codigoBarras = ejemplar.codigoBarras;
    this.ejemplarSeleccionado = null;
    this.libroSeleccionado = null;
    this.mensaje = '';

    try {
      await this.procesarEjemplarEncontrado(ejemplar);
    } catch (error) {
      console.error(error);
      this.mostrarMensaje('No se pudo cargar el ejemplar elegido.', true);
    }
  }

  private async procesarEjemplarEncontrado(ejemplar: Ejemplar): Promise<void> {
    const libro = await this._libroService.obtenerLibroPorId(ejemplar.idLibro);

    if (!libro) {
      this.mostrarMensaje('No se encontró el libro del ejemplar.', true);
      return;
    }

    this.ejemplarSeleccionado = ejemplar;
    this.libroSeleccionado = libro;

    if (libro.activo === false) {
      this.mostrarMensaje('El libro está dado de baja.', true);
      return;
    }

    if (ejemplar.estadoEjemplar !== 'disponible') {
      this.mostrarMensaje(
        `El ejemplar no está disponible. Estado actual: ${ejemplar.estadoEjemplar}.`,
        true,
      );
      return;
    }

    this.mostrarMensaje('Ejemplar disponible para prestar.', false);
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
      await this.buscarEjemplar();
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

  async registrarPrestamo(): Promise<void> {
    if (!this.puedeRegistrar || this.guardando) {
      this.mostrarMensaje('Revisá los datos antes de confirmar.', true);
      return;
    }

    const fechaSeleccionada = new Date(`${this.fechaDevEstimada}T23:59:59.999`);

    if (Number.isNaN(fechaSeleccionada.getTime())) {
      this.mostrarMensaje('Seleccioná una fecha de devolución válida.', true);
      return;
    }

    this.guardando = true;
    this.mensaje = '';

    try {
      const prestamo = await this._prestamoService.crearPrestamo(
        this.idUsuario,
        this.ejemplarSeleccionado!.id,
        this.bibliotecarioActual!.id,
        fechaSeleccionada.toISOString(),
      );

      if (!prestamo) {
        this.mostrarMensaje(
          'No se pudo registrar el préstamo. Verificá que el ejemplar siga disponible.',
          true,
        );
        return;
      }

      this.mostrarMensaje('Préstamo registrado correctamente.', false);
      await this._router.navigate(['/dashboard/prestamos']);
    } catch (error) {
      console.error(error);
      this.mostrarMensaje(
        error instanceof Error
          ? error.message
          : 'No se pudo registrar el préstamo.',
        true,
      );
    } finally {
      this.guardando = false;
    }
  }

  get lectorSeleccionado(): Usuario | null {
    return this.lectores.find((lector) => lector.id === this.idUsuario) ?? null;
  }

  get escanerDisponible(): boolean {
    return this._barcodeService.esAndroidNativo();
  }

  get ejemplarDisponible(): boolean {
    return (
      this.ejemplarSeleccionado?.estadoEjemplar === 'disponible' &&
      this.libroSeleccionado?.activo !== false
    );
  }

  get puedeRegistrar(): boolean {
    return Boolean(
      this.idUsuario &&
      this.ejemplarDisponible &&
      this.fechaDevEstimada &&
      this.fechaDevEstimada >= this.fechaMinima &&
      this.bibliotecarioActual &&
      !this.tieneMultaPendiente,
    );
  }

  private convertirFechaParaInput(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  private mostrarMensaje(mensaje: string, esError: boolean): void {
    this.mensaje = mensaje;
    this.mensajeEsError = esError;
  }
}
