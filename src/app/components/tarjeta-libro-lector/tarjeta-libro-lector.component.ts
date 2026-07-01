import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';
import { Libro } from '../../models/libro.model';

@Component({
  selector: 'app-tarjeta-libro-lector',
  standalone: true,
  imports: [IonIcon],
  template: `
    <article class="libro-card" (click)="onSeleccion()">
      <div class="libro-portada">
        @if (libro.imagenPortada) {
          <img [src]="libro.imagenPortada" [alt]="libro.titulo" loading="lazy" />
        } @else {
          <div class="portada-placeholder">
            <ion-icon name="book-outline"></ion-icon>
          </div>
        }
      </div>
      <div class="libro-info">
        <h3>{{ libro.titulo }}</h3>
        <p class="autores">{{ libro.autores.join(', ') }}</p>
        <p class="categorias">{{ libro.categorias.join(', ') }}</p>
        @if (usuarioLogueado) {
          <div class="libro-footer">
            @if (libro.cantidadDisponible > 0) {
              <span class="badge badge-disponible">Disponible</span>
            } @else {
              <span class="badge badge-no-disponible">No disponible</span>
            }
            <span class="stock">{{ libro.cantidadDisponible }} disponibles</span>
          </div>
        }
      </div>
    </article>
  `,
  styles: `
    .libro-card {
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      display: flex;
      flex-direction: column;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
      }
    }

    .libro-portada {
      width: 100%;
      aspect-ratio: 2 / 3;
      overflow: hidden;
      background: #f5f0eb;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .portada-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f5f0eb 0%, #e8e0d8 100%);

      ion-icon {
        font-size: 3rem;
        color: #bfae9e;
      }
    }

    .libro-info {
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;

      h3 {
        margin: 0;
        font-family: 'Nunito', sans-serif;
        font-weight: 700;
        font-size: 0.95rem;
        color: #2d2d2d;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .autores {
        margin: 0;
        font-family: 'Inter', sans-serif;
        font-size: 0.8rem;
        color: #6b6b6b;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .categorias {
        margin: 0;
        font-family: 'Inter', sans-serif;
        font-size: 0.75rem;
        color: #bfae9e;
      }
    }

    .libro-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 8px;
    }

    .badge {
      font-family: 'Nunito', sans-serif;
      font-weight: 700;
      font-size: 0.7rem;
      padding: 4px 10px;
      border-radius: 20px;
    }

    .badge-disponible {
      background: #e6f4ea;
      color: #1e7e34;
    }

    .badge-no-disponible {
      background: #fde8e8;
      color: #c62828;
    }

    .stock {
      font-family: 'Inter', sans-serif;
      font-size: 0.75rem;
      color: #999;
    }
  `,
})
export class TarjetaLibroLectorComponent {
  @Input({ required: true }) libro!: Libro;
  @Input() usuarioLogueado = false;
  @Output() seleccionar = new EventEmitter<string>();

  constructor(private router: Router) {}

  onSeleccion() {
    if (!this.usuarioLogueado) {
      this.router.navigate(['/auth/login']);
    } else {
      this.seleccionar.emit(this.libro.id);
    }
  }
}
