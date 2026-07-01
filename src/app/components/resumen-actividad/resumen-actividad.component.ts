import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';


import { IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';


@Component({
  selector: 'app-resumen-actividad',
  templateUrl: './resumen-actividad.component.html',
  styleUrls: ['./resumen-actividad.component.scss'],
  standalone: true,
  imports: [CommonModule, IonCard, IonCardHeader, IonCardTitle, IonCardContent],
})
export class ResumenActividadComponent {




  @Input() prestamosActivos!: number;
  @Input() librosLeidos!: number;
  @Input() multasPendientes!: number;
  @Input() miembroDesde!: string;


}
