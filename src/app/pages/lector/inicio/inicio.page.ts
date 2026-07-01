import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';
import { Usuario } from 'src/app/models';

@Component({
  selector: 'app-lector-inicio',
  standalone: true,
  imports: [IonContent, IonIcon],
  template: `
    <ion-content>
      <main class="inicio-container">
        <h1>Bienvenido, {{ usuario?.nombreCompleto }}</h1>
        <p class="inicio-subtitle">Tu espacio de lectura</p>

        <div class="inicio-actions">
          <button class="action-card" (click)="irACatalogo()">
            <ion-icon name="library-outline"></ion-icon>
            <h3>Explorar catálogo</h3>
            <p>Descubrí nuestros libros disponibles</p>
          </button>

          <button class="action-card" (click)="irAMisPrestamos()">
            <ion-icon name="swap-horizontal"></ion-icon>
            <h3>Mis préstamos</h3>
            <p>Revisá tus préstamos activos</p>
          </button>
        </div>
      </main>
    </ion-content>
  `,
  styles: `
    .inicio-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 24px 16px;
    }

    h1 {
      margin: 0;
      font-family: 'Nunito', sans-serif;
      font-weight: 800;
      font-size: 1.5rem;
      color: #2d2d2d;
    }

    .inicio-subtitle {
      margin: 4px 0 24px;
      font-family: 'Inter', sans-serif;
      font-size: 0.9rem;
      color: #999;
    }

    .inicio-actions {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
    }

    .action-card {
      background: #ffffff;
      border: none;
      border-radius: 16px;
      padding: 24px;
      text-align: left;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      transition: transform 0.2s ease, box-shadow 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      }

      ion-icon {
        font-size: 2rem;
        color: #ff6b35;
        margin-bottom: 12px;
      }

      h3 {
        margin: 0 0 4px;
        font-family: 'Nunito', sans-serif;
        font-weight: 700;
        font-size: 1.1rem;
        color: #2d2d2d;
      }

      p {
        margin: 0;
        font-family: 'Inter', sans-serif;
        font-size: 0.85rem;
        color: #999;
      }
    }

    @media (min-width: 600px) {
      .inicio-actions {
        grid-template-columns: 1fr 1fr;
      }
    }
  `,
})
export class LectorInicioPage implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  usuario: Usuario | null = null;

  async ngOnInit() {
    this.usuario = await this.authService.usuarioActual();
  }

  irACatalogo() {
    this.router.navigate(['/catalogo']);
  }

  irAMisPrestamos() {
    this.router.navigate(['/lector/mis-prestamos']);
  }
}
