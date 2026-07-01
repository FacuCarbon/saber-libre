import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { PrestamoService } from 'src/app/services/prestamo.service';
import { EjemplarService } from 'src/app/services/ejemplar.service';
import { LibroService } from 'src/app/services/libro.service';
import { PrestamoDetalle } from 'src/app/models';

@Component({
  selector: 'app-mis-prestamos',
  standalone: true,
  imports: [IonContent, IonIcon, DatePipe],
  template: `
    <ion-content>
      <main class="prestamos-container">
        <h1>Mis préstamos</h1>

        @if (cargando) {
          <p class="prestamos-vacio">Cargando...</p>
        } @else if (prestamos.length === 0) {
          <div class="prestamos-vacio">
            <ion-icon name="swap-horizontal"></ion-icon>
            <p>No tenés préstamos activos</p>
          </div>
        } @else {
          <div class="prestamos-lista">
            @for (detalle of prestamos; track detalle.prestamo.id) {
              <div class="prestamo-card">
                <div class="prestamo-info">
                  <h3>{{ detalle.libro?.titulo ?? 'Libro desconocido' }}</h3>
                  <p class="prestamo-ejemplar">Ejemplar: {{ detalle.ejemplar?.ubicacion ?? '-' }}</p>
                  <p class="prestamo-fechas">
                    Prestado: {{ detalle.prestamo.fechaPrestamo | date:'dd/MM/yyyy' }}
                  </p>
                  <p class="prestamo-fechas">
                    Devolución estimada: {{ detalle.prestamo.fechaDevEstimada | date:'dd/MM/yyyy' }}
                  </p>
                </div>
                <div class="prestamo-estado">
                  @if (detalle.estado === 'activo') {
                    <span class="badge badge-activo">Activo</span>
                  } @else if (detalle.estado === 'vencido') {
                    <span class="badge badge-vencido">Vencido</span>
                  } @else {
                    <span class="badge badge-devuelto">Devuelto</span>
                  }
                </div>
              </div>
            }
          </div>
        }
      </main>
    </ion-content>
  `,
  styles: `
    .prestamos-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px 16px;
    }

    h1 {
      margin: 0 0 24px;
      font-family: 'Nunito', sans-serif;
      font-weight: 800;
      font-size: 1.5rem;
      color: #2d2d2d;
    }

    .prestamos-vacio {
      text-align: center;
      padding: 40px 20px;
      color: #999;

      ion-icon {
        font-size: 3rem;
        color: #d4cdc5;
        margin-bottom: 12px;
      }

      p {
        margin: 0;
        font-family: 'Inter', sans-serif;
        font-size: 0.95rem;
      }
    }

    .prestamos-lista {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .prestamo-card {
      background: #ffffff;
      border-radius: 12px;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    }

    .prestamo-info {
      flex: 1;

      h3 {
        margin: 0 0 4px;
        font-family: 'Nunito', sans-serif;
        font-weight: 700;
        font-size: 1rem;
        color: #2d2d2d;
      }

      p {
        margin: 0;
        font-family: 'Inter', sans-serif;
        font-size: 0.8rem;
        color: #999;
      }

      .prestamo-ejemplar {
        color: #bfae9e;
      }
    }

    .badge {
      font-family: 'Nunito', sans-serif;
      font-weight: 700;
      font-size: 0.7rem;
      padding: 4px 10px;
      border-radius: 20px;
      white-space: nowrap;
    }

    .badge-activo {
      background: #e6f4ea;
      color: #1e7e34;
    }

    .badge-vencido {
      background: #fde8e8;
      color: #c62828;
    }

    .badge-devuelto {
      background: #e8e0d8;
      color: #6b6b6b;
    }
  `,
})
export class MisPrestamosPage implements OnInit {
  private authService = inject(AuthService);
  private prestamoService = inject(PrestamoService);
  private ejemplarService = inject(EjemplarService);
  private libroService = inject(LibroService);

  prestamos: PrestamoDetalle[] = [];
  cargando = true;

  async ngOnInit() {
    const usuario = await this.authService.usuarioActual();
    if (!usuario) {
      this.cargando = false;
      return;
    }

    const prestamos = await this.prestamoService.obtenerPrestamosPorUsuario(usuario.id);

    const detalles = await Promise.all(
      prestamos.map(async (prestamo) => {
        const ejemplar = await this.ejemplarService.obtenerEjemplarPorId(prestamo.idEjemplar);
        const libro = ejemplar ? await this.libroService.obtenerLibroPorId(ejemplar.idLibro) : null;

        let estado: 'activo' | 'vencido' | 'devuelto' = 'activo';
        if (prestamo.fechaDevReal) {
          estado = 'devuelto';
        } else if (new Date(prestamo.fechaDevEstimada) < new Date()) {
          estado = 'vencido';
        }

        return { prestamo, usuario, ejemplar, libro, estado };
      }),
    );

    this.prestamos = detalles;
    this.cargando = false;
  }
}
