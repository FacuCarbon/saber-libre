import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonChip } from '@ionic/angular/standalone';

@Component({
  selector: 'app-chips-categorias',
  standalone: true,
  imports: [IonChip],
  template: `
    <div class="chips-container">
      @for (cat of categorias; track cat) {
        <ion-chip
          [class.seleccionada]="cat === seleccionada"
          (click)="seleccion.emit(cat)"
        >
          {{ cat }}
        </ion-chip>
      }
    </div>
  `,
  styles: `
    .chips-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    ion-chip {
      --background: #e8e0d8;
      --color: #4a4a4a;
      font-family: 'Nunito', sans-serif;
      font-weight: 600;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: #ddd4ca;
      }

      &.seleccionada {
        --background: #ff6b35;
        --color: #ffffff;
      }
    }
  `,
})
export class ChipsCategoriasComponent {
  @Input() categorias: string[] = [];
  @Input() seleccionada = '';
  @Output() seleccion = new EventEmitter<string>();
}
