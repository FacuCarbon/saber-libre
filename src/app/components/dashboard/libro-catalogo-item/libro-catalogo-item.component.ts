import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Libro } from 'src/app/models';
import {
  IonButton,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonPopover,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-libro-catalogo-item',
  templateUrl: './libro-catalogo-item.component.html',
  styleUrls: ['./libro-catalogo-item.component.scss'],
  standalone: true,
  imports: [IonButton, IonIcon, IonItem, IonLabel, IonList, IonPopover],
})
export class LibroCatalogoItemComponent {
  constructor() {}

  @Input() libro!: Libro;
  @Output() verDetalles = new EventEmitter<string>();
  @Output() editarLibro = new EventEmitter<string>();
  @Output() gestionarEjemplares = new EventEmitter<string>();
  @Output() eliminarLibro = new EventEmitter<string>();
}
