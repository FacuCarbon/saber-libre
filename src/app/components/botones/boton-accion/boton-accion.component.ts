import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
} from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import type { IconosAppType } from 'src/app/iconos.config';

export type SizeBotton = 'chico' | 'mediano' | 'grande';

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
  @Input() size: SizeBotton = 'mediano';
  @Input() anchoCompleto = false;
  @HostBinding('class.ancho-completo')
  get ocuparTodoElAncho(): boolean {
    return this.anchoCompleto;
  }
  @Output() accion = new EventEmitter<void>();
}
