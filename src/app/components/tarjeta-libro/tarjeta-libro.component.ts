import { Component, OnInit, Input } from '@angular/core';
import { Libro } from '../../models/libro.model';
import { IonCard, IonCardTitle, IonCardHeader, IonButton, IonImg, IonCardSubtitle, IonCardContent } from "@ionic/angular/standalone";


@Component({
  selector: 'app-tarjeta-libro',
  standalone: true,
  imports: [IonCard, IonCardContent, IonCardTitle, IonCardHeader, IonButton, IonImg, IonCardSubtitle],
  templateUrl: './tarjeta-libro.component.html',
  styleUrls: ['./tarjeta-libro.component.scss'],
})
export class TarjetaLibroComponent  implements OnInit {

  @Input() libro!: Libro;

  constructor() { }

  ngOnInit() {}
  
  }
