import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonChip, IonIcon, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { BuscadorLibrosComponent } from '../buscador-libros/buscador-libros.component';

@Component({
  selector: 'app-filtros-catalogo',
  standalone: true,
  imports: [IonChip, IonIcon, IonSelect, IonSelectOption, BuscadorLibrosComponent],
  template: `
    <div class="filtros-panel">
      <app-buscador-libros (busqueda)="busqueda.emit($event)" />
      <div class="filtros-selects">
        <ion-select
          [value]="categoriaActiva"
          placeholder="Todas las categorías"
          class="filtro-select"
          (ionChange)="onCategoriaChange($event.detail.value)"
        >
          @for (cat of categorias; track cat) {
            <ion-select-option [value]="cat">{{ cat }}</ion-select-option>
          }
        </ion-select>
        @if (usuarioLogueado) {
          <ion-select
            [value]="disponibilidadActiva"
            placeholder="Disponibilidad"
            class="filtro-select"
            (ionChange)="onDisponibilidadChange($event.detail.value)"
          >
            <ion-select-option value="disponible">Disponibles</ion-select-option>
            <ion-select-option value="no-disponible">No disponibles</ion-select-option>
          </ion-select>
        }
      </div>
      @if (categoriaActiva || disponibilidadActiva) {
        <div class="chips-activos">
          @if (categoriaActiva) {
            <ion-chip (click)="limpiarCategoria.emit()">
              {{ categoriaActiva }}
              <ion-icon name="close-circle"></ion-icon>
            </ion-chip>
          }
          @if (disponibilidadActiva) {
            <ion-chip (click)="limpiarDisponibilidad.emit()">
              {{ disponibilidadActiva === 'disponible' ? 'Disponibles' : 'No disponibles' }}
              <ion-icon name="close-circle"></ion-icon>
            </ion-chip>
          }
        </div>
      }
    </div>
  `,
  styles: `
    .filtros-panel {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .filtros-selects {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .filtro-select {
      flex: 1;
      min-width: 160px;
      --background: #f5f0eb;
      --border-radius: 12px;
      --padding-start: 16px;
      --padding-end: 16px;
      font-family: 'Nunito', sans-serif;
    }

    .chips-activos {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    ion-chip {
      --background: #fff4ef;
      --color: #ff6b35;
      font-family: 'Nunito', sans-serif;
      font-weight: 600;
      font-size: 0.8rem;
      cursor: pointer;

      ion-icon {
        margin-left: 4px;
        font-size: 1rem;
      }

      &:hover {
        background: #ffe0d0;
      }
    }
  `,
})
export class FiltrosCatalogoComponent {
  @Input() categorias: string[] = [];
  @Input() usuarioLogueado = false;
  @Input() categoriaActiva = '';
  @Input() disponibilidadActiva = '';
  @Output() busqueda = new EventEmitter<string>();
  @Output() categoriaSeleccionada = new EventEmitter<string>();
  @Output() disponibilidadSeleccionada = new EventEmitter<string>();
  @Output() limpiarCategoria = new EventEmitter<void>();
  @Output() limpiarDisponibilidad = new EventEmitter<void>();

  onCategoriaChange(value: string) {
    if (value) {
      this.categoriaSeleccionada.emit(value);
    }
  }

  onDisponibilidadChange(value: string) {
    if (value) {
      this.disponibilidadSeleccionada.emit(value);
    }
  }
}
