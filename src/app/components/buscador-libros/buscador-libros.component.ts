import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { SearchbarCustomEvent } from '@ionic/core';
import { IonSearchbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-buscador-libros',
  templateUrl: './buscador-libros.component.html',
  styleUrls: ['./buscador-libros.component.scss'],
  standalone: true,
  imports: [IonSearchbar],
})
export class BuscadorLibrosComponent {
  @Input() placeholder = 'Buscar por título, autor o ISBN...';
  @Input() debounce = 250;

  @Output() busqueda = new EventEmitter<string>();

  emitirBusqueda(evento: SearchbarCustomEvent): void {
    const valor = evento.detail.value ?? '';
    this.busqueda.emit(valor.trim());
  }
}
