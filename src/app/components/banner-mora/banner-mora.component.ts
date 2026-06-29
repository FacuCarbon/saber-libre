import { Component, Input } from '@angular/core';
import { IonButton, IonCard, IonCardContent, IonIcon } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { warningOutline } from 'ionicons/icons';


@Component({
  selector: 'app-banner-mora-component',
  standalone: true,
  imports: [IonCard, IonCardContent, IonButton, IonIcon],
  templateUrl: './banner-mora.component.html',
  styleUrls: ['./banner-mora.component.scss'],

})
export class BannerMoraComponent {

  @Input() titulo = ' ';
  @Input() mensaje = ' ';
  @Input() textoBoton = ' ';

  constructor() {
    addIcons({ 'warning-outline': warningOutline });
  }

}