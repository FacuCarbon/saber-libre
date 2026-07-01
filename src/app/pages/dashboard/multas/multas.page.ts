import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonSpinner,
} from '@ionic/angular/standalone';
import { BuscadorLibrosComponent } from 'src/app/components/buscador-libros/buscador-libros.component';
import { HeaderPageComponent } from 'src/app/components/dashboard/header-page/header-page.component';
import { ItemMultaComponent } from 'src/app/components/dashboard/item-multa/item-multa.component';
import {
  Ejemplar,
  Libro,
  Multa,
  MultaDetalle,
  Prestamo,
  Usuario,
} from 'src/app/models';
import { AuthService } from 'src/app/services/auth.service';
import { EjemplarService } from 'src/app/services/ejemplar.service';
import { LibroService } from 'src/app/services/libro.service';
import { MultaService } from 'src/app/services/multa.service';
import { PrestamoService } from 'src/app/services/prestamo.service';

type FiltroEstado = 'todas' | 'pendiente' | 'pagada';

@Component({
  selector: 'app-multas',
  templateUrl: './multas.page.html',
  styleUrls: ['./multas.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BuscadorLibrosComponent,
    HeaderPageComponent,
    ItemMultaComponent,
    IonIcon,
    IonSelect,
    IonSelectOption,
    IonSpinner,
  ],
})
export class MultasPage implements OnInit {
  private _multaService = inject(MultaService);
  private _authService = inject(AuthService);
  private _prestamoService = inject(PrestamoService);
  private _ejemplarService = inject(EjemplarService);
  private _libroService = inject(LibroService);
  private _router = inject(Router);

  multas: MultaDetalle[] = [];
  multasFiltradas: MultaDetalle[] = [];
  filtroEstado: FiltroEstado = 'todas';
  busquedaActual = '';
  cargando = true;
  idProcesando: string | null = null;
  mensaje = '';
  mensajeEsError = false;

  get cantidadPendientes(): number {
    return this.multas.filter((detalle) => !detalle.multa.pagada).length;
  }

  get cantidadPagadas(): number {
    return this.multas.filter((detalle) => detalle.multa.pagada).length;
  }

  get montoPendienteTotal(): number {
    return this.multas
      .filter((detalle) => !detalle.multa.pagada)
      .reduce((total, detalle) => total + detalle.multa.monto, 0);
  }

  async ngOnInit(): Promise<void> {
    await this.cargarMultas();
  }

  registrarMulta(): void {
    this._router.navigate(['/dashboard/multas/registrar']);
  }

  filtrarMultas(busqueda: string): void {
    this.busquedaActual = busqueda;
    this.aplicarFiltros();
  }

  cambiarFiltroEstado(): void {
    this.aplicarFiltros();
  }

  async marcarComoPagada(idMulta: string): Promise<void> {
    if (this.idProcesando) {
      return;
    }

    this.idProcesando = idMulta;
    this.mensaje = '';

    try {
      const pagada = await this._multaService.pagarMulta(idMulta);

      if (!pagada) {
        this.mostrarMensaje('No se pudo registrar el pago de la multa.', true);
        return;
      }

      await this.cargarMultas();
      this.mostrarMensaje('Multa marcada como pagada.');
    } catch (error) {
      console.error(error);
      this.mostrarMensaje('No se pudo registrar el pago de la multa.', true);
    } finally {
      this.idProcesando = null;
    }
  }

  private async cargarMultas(): Promise<void> {
    this.cargando = true;

    try {
      const [multas, usuarios, prestamos, ejemplares, libros] =
        await Promise.all([
          this._multaService.obtenerMultas(),
          this._authService.obtenerUsuarios(),
          this._prestamoService.obtenerPrestamos(),
          this._ejemplarService.obtenerEjemplares(),
          this._libroService.obtenerLibros(),
        ]);

      this.multas = this.armarDetalles(
        multas,
        usuarios,
        prestamos,
        ejemplares,
        libros,
      );
      this.aplicarFiltros();
    } catch (error) {
      console.error(error);
      this.mostrarMensaje('No se pudieron cargar las multas.', true);
    } finally {
      this.cargando = false;
    }
  }

  private armarDetalles(
    multas: Multa[],
    usuarios: Usuario[],
    prestamos: Prestamo[],
    ejemplares: Ejemplar[],
    libros: Libro[],
  ): MultaDetalle[] {
    return multas
      .map((multa) => {
        const prestamo =
          prestamos.find((item) => item.id === multa.idPrestamo) ?? null;
        const ejemplar = prestamo
          ? (ejemplares.find((item) => item.id === prestamo.idEjemplar) ??
            null)
          : null;
        const libro = ejemplar
          ? (libros.find((item) => item.id === ejemplar.idLibro) ?? null)
          : null;

        return {
          multa,
          usuario:
            usuarios.find((item) => item.id === multa.idUsuario) ?? null,
          prestamo,
          libro,
        };
      })
      .sort((a, b) => Number(a.multa.pagada) - Number(b.multa.pagada));
  }

  private aplicarFiltros(): void {
    const busqueda = this.busquedaActual.toLowerCase().trim();

    this.multasFiltradas = this.multas.filter((detalle) => {
      const coincideEstado =
        this.filtroEstado === 'todas' ||
        (this.filtroEstado === 'pendiente' && !detalle.multa.pagada) ||
        (this.filtroEstado === 'pagada' && detalle.multa.pagada);

      if (!coincideEstado) {
        return false;
      }

      if (!busqueda) {
        return true;
      }

      const lector = detalle.usuario?.nombreCompleto.toLowerCase() ?? '';
      const libro = detalle.libro?.titulo.toLowerCase() ?? '';

      return lector.includes(busqueda) || libro.includes(busqueda);
    });
  }

  private mostrarMensaje(mensaje: string, esError = false): void {
    this.mensaje = mensaje;
    this.mensajeEsError = esError;
  }
}
