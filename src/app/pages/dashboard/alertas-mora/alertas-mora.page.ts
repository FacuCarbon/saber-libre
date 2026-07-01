import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonButton, IonIcon, IonSpinner } from '@ionic/angular/standalone';

import { BuscadorLibrosComponent } from 'src/app/components/buscador-libros/buscador-libros.component';
import { HeaderPageComponent } from 'src/app/components/dashboard/header-page/header-page.component';
import { AlertaMora, Ejemplar, Libro, Prestamo, Usuario } from 'src/app/models';
import { AlertaMoraService } from 'src/app/services/alerta-mora.service';
import { AuthService } from 'src/app/services/auth.service';
import { EjemplarService } from 'src/app/services/ejemplar.service';
import { LibroService } from 'src/app/services/libro.service';
import { PrestamoService } from 'src/app/services/prestamo.service';

interface AlertaMoraDetalle {
  alerta: AlertaMora;
  prestamo: Prestamo;
  usuario: Usuario | null;
  ejemplar: Ejemplar | null;
  libro: Libro | null;
  diasMora: number;
}

@Component({
  selector: 'app-alertas-mora',
  templateUrl: './alertas-mora.page.html',
  styleUrls: ['./alertas-mora.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    BuscadorLibrosComponent,
    HeaderPageComponent,
    IonButton,
    IonIcon,
    IonSpinner,
  ],
})
export class AlertasMoraPage implements OnInit {
  private _alertaMoraService = inject(AlertaMoraService);
  private _authService = inject(AuthService);
  private _ejemplarService = inject(EjemplarService);
  private _libroService = inject(LibroService);
  private _prestamoService = inject(PrestamoService);
  private _router = inject(Router);

  alertas: AlertaMoraDetalle[] = [];
  alertasFiltradas: AlertaMoraDetalle[] = [];
  cargando = true;
  mensaje = '';

  async ngOnInit(): Promise<void> {
    await this.cargarAlertas();
  }

  filtrarAlertas(busqueda: string): void {
    const termino = busqueda.trim().toLowerCase();
    this.alertasFiltradas = this.alertas.filter((detalle) => {
      const lector = detalle.usuario?.nombreCompleto.toLowerCase() ?? '';
      const libro = detalle.libro?.titulo.toLowerCase() ?? '';
      const codigo = detalle.ejemplar?.codigoBarras.toLowerCase() ?? '';
      return !termino || lector.includes(termino) || libro.includes(termino) || codigo.includes(termino);
    });
  }

  procesarDevolucion(detalle: AlertaMoraDetalle): void {
    this._router.navigate(['/dashboard/prestamos/devolver'], {
      queryParams: detalle.ejemplar
        ? { codigo: detalle.ejemplar.codigoBarras }
        : undefined,
    });
  }

  private async cargarAlertas(): Promise<void> {
    this.cargando = true;
    this.mensaje = '';

    try {
      const alertas = await this._alertaMoraService.sincronizarAlertas();
      const [prestamos, usuarios, ejemplares, libros] = await Promise.all([
        this._prestamoService.obtenerPrestamos(),
        this._authService.obtenerUsuarios(),
        this._ejemplarService.obtenerEjemplares(),
        this._libroService.obtenerLibros(),
      ]);

      this.alertas = alertas
        .map((alerta): AlertaMoraDetalle | null => {
          const prestamo = prestamos.find(
            (item) => item.id === alerta.idPrestamo,
          );
          if (!prestamo) {
            return null;
          }

          const ejemplar =
            ejemplares.find((item) => item.id === prestamo.idEjemplar) ?? null;
          const libro = ejemplar
            ? (libros.find((item) => item.id === ejemplar.idLibro) ?? null)
            : null;

          return {
            alerta,
            prestamo,
            usuario:
              usuarios.find((item) => item.id === prestamo.idUsuario) ?? null,
            ejemplar,
            libro,
            diasMora: this.calcularDiasMora(prestamo.fechaDevEstimada),
          };
        })
        .filter((detalle): detalle is AlertaMoraDetalle => detalle !== null)
        .sort((a, b) => b.diasMora - a.diasMora);
      this.alertasFiltradas = [...this.alertas];
    } catch (error) {
      console.error(error);
      this.mensaje = 'No se pudieron actualizar las alertas de mora.';
    } finally {
      this.cargando = false;
    }
  }

  private calcularDiasMora(fechaVencimiento: string): number {
    const diferencia = Date.now() - new Date(fechaVencimiento).getTime();
    return Math.max(1, Math.ceil(diferencia / 86_400_000));
  }
}
