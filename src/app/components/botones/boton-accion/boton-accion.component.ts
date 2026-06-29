import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import type { IconosAppType } from 'src/app/iconos.config';

@Component({
  selector: 'app-boton-accion',
  templateUrl: './boton-accion.component.html',
  styleUrls: ['./boton-accion.component.scss'],
  standalone: true,
  imports: [IonButton, IonIcon],
})
export class BotonAccionComponent {
  @Input({ required: true }) texto!: string;
  @Input() icono?: IconosAppType;
  @Input() deshabilitado = false;

  @Output() accion = new EventEmitter<void>();
}
