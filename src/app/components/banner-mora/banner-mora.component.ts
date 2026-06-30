import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonIcon,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-banner-mora-component',
  standalone: true,
  imports: [IonCard, IonCardContent, IonButton, IonIcon],
  templateUrl: './banner-mora.component.html',
  styleUrls: ['./banner-mora.component.scss'],

})
export class BannerMoraComponent {
  @Input() titulo = '';
  @Input() mensaje = '';
  @Input() textoBoton = '';

  @Output() accion = new EventEmitter<void>();
}
