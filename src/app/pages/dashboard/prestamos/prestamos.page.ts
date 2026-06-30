import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonSpinner,
} from '@ionic/angular/standalone';
import { BuscadorLibrosComponent } from 'src/app/components/buscador-libros/buscador-libros.component';
import { HeaderPageComponent } from 'src/app/components/dashboard/header-page/header-page.component';
import { ItemPrestamoComponent } from 'src/app/components/dashboard/item-prestamo/item-prestamo.component';
import {
  Ejemplar,
  EstadoPrestamo,
  Libro,
  Prestamo,
  PrestamoDetalle,
  Usuario,
} from 'src/app/models';
import { AuthService } from 'src/app/services/auth.service';
import { DatosPruebaService } from 'src/app/services/datos-prueba.service';
import { EjemplarService } from 'src/app/services/ejemplar.service';
import { LibroService } from 'src/app/services/libro.service';

import { PrestamoService } from 'src/app/services/prestamo.service';

type FiltroEstado = 'todos' | EstadoPrestamo;

@Component({
  selector: 'app-prestamos',
  templateUrl: './prestamos.page.html',
  styleUrls: ['./prestamos.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BuscadorLibrosComponent,
    HeaderPageComponent,
    ItemPrestamoComponent,
    IonButton,
    IonIcon,
    IonSelect,
    IonSelectOption,
    IonSpinner,
  ],
})
export class PrestamosPage implements OnInit {
  private _prestamoService = inject(PrestamoService);
  private _authService = inject(AuthService);
  private _ejemplarService = inject(EjemplarService);
  private _libroService = inject(LibroService);
  private _datosPruebaService = inject(DatosPruebaService);
  private _router = inject(Router);

  prestamos: PrestamoDetalle[] = [];
  prestamosFiltrados: PrestamoDetalle[] = [];
  filtroEstado: FiltroEstado = 'todos';
  busquedaActual = '';
  cargando = true;
  procesandoDatosPrueba = false;
  mostrarConfirmacionDatos = false;
  mensaje = '';
  mensajeEsError = false;

  get cantidadActivos(): number {
    return this.prestamos.filter((detalle) => detalle.estado !== 'devuelto')
      .length;
  }

  get cantidadVencidos(): number {
    return this.prestamos.filter((detalle) => detalle.estado === 'vencido')
      .length;
  }

  get cantidadDevueltos(): number {
    return this.prestamos.filter((detalle) => detalle.estado === 'devuelto')
      .length;
  }

  async ngOnInit(): Promise<void> {
    await this.cargarPrestamos();
  }

  registrarPrestamo(): void {
    this._router.navigate(['/dashboard/prestamos/registrar']);
  }

  procesarDevolucion(codigoBarras?: string): void {
    this._router.navigate(['/dashboard/prestamos/devolver'], {
      queryParams: codigoBarras ? { codigo: codigoBarras } : undefined,
    });
  }

  filtrarPrestamos(busqueda: string): void {
    this.busquedaActual = busqueda;
    this.aplicarFiltros();
  }

  cambiarFiltroEstado(): void {
    this.aplicarFiltros();
  }

  solicitarDatosPrueba(): void {
    this.mostrarConfirmacionDatos = true;
    this.mensaje = '';
  }

  cancelarDatosPrueba(): void {
    this.mostrarConfirmacionDatos = false;
  }

  async confirmarDatosPrueba(): Promise<void> {
    if (this.procesandoDatosPrueba) {
      return;
    }

    this.procesandoDatosPrueba = true;
    this.mensaje = '';

    try {
      const resultado = await this._datosPruebaService.cargarDatosPrueba();

      if (!resultado.exito) {
        this.mostrarMensaje(resultado.mensaje, true);
        return;
      }

      this.mostrarConfirmacionDatos = false;
      await this.cargarPrestamos();
      this.mostrarMensaje(resultado.mensaje);
    } catch (error) {
      console.error(error);
      this.mostrarMensaje(
        error instanceof Error
          ? error.message
          : 'No se pudieron cargar los datos de prueba.',
        true,
      );
    } finally {
      this.procesandoDatosPrueba = false;
    }
  }

  private async cargarPrestamos(): Promise<void> {
    this.cargando = true;

    try {
      const [prestamos, usuarios, ejemplares, libros] = await Promise.all([
        this._prestamoService.obtenerPrestamos(),
        this._authService.obtenerUsuarios(),
        this._ejemplarService.obtenerEjemplares(),
        this._libroService.obtenerLibros(),
      ]);

      this.prestamos = this.armarDetalles(
        prestamos,
        usuarios,
        ejemplares,
        libros,
      );
      this.aplicarFiltros();
    } catch (error) {
      console.error(error);
      this.mostrarMensaje('No se pudieron cargar los préstamos.', true);
    } finally {
      this.cargando = false;
    }
  }

  private armarDetalles(
    prestamos: Prestamo[],
    usuarios: Usuario[],
    ejemplares: Ejemplar[],
    libros: Libro[],
  ): PrestamoDetalle[] {
    return prestamos
      .map((prestamo) => {
        const ejemplar =
          ejemplares.find((item) => item.id === prestamo.idEjemplar) ?? null;
        const libro = ejemplar
          ? (libros.find((item) => item.id === ejemplar.idLibro) ?? null)
          : null;

        return {
          prestamo,
          usuario:
            usuarios.find((item) => item.id === prestamo.idUsuario) ?? null,
          ejemplar,
          libro,
          estado: this.obtenerEstado(prestamo),
        };
      })
      .sort(
        (a, b) =>
          new Date(b.prestamo.fechaPrestamo).getTime() -
          new Date(a.prestamo.fechaPrestamo).getTime(),
      );
  }

  private obtenerEstado(prestamo: Prestamo): EstadoPrestamo {
    if (prestamo.fechaDevReal) {
      return 'devuelto';
    }

    if (new Date(prestamo.fechaDevEstimada).getTime() < Date.now()) {
      return 'vencido';
    }

    return 'activo';
  }

  private aplicarFiltros(): void {
    const busqueda = this.busquedaActual.toLowerCase().trim();

    this.prestamosFiltrados = this.prestamos.filter((detalle) => {
      const coincideEstado =
        this.filtroEstado === 'todos' || detalle.estado === this.filtroEstado;

      if (!coincideEstado) {
        return false;
      }

      if (!busqueda) {
        return true;
      }

      const lector = detalle.usuario?.nombreCompleto.toLowerCase() ?? '';
      const libro = detalle.libro?.titulo.toLowerCase() ?? '';
      const codigo = detalle.ejemplar?.codigoBarras.toLowerCase() ?? '';

      return (
        lector.includes(busqueda) ||
        libro.includes(busqueda) ||
        codigo.includes(busqueda)
      );
    });
  }

  private mostrarMensaje(mensaje: string, esError = false): void {
    this.mensaje = mensaje;
    this.mensajeEsError = esError;
  }
}
