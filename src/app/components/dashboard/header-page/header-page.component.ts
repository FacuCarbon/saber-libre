import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  BotonAccionComponent,
  SizeBotton,
} from 'src/app/components/botones/boton-accion/boton-accion.component';
import type { IconosAppType } from 'src/app/iconos.config';

@Component({
  selector: 'app-header-page',
  templateUrl: './header-page.component.html',
  styleUrls: ['./header-page.component.scss'],
  standalone: true,
  imports: [BotonAccionComponent],
})
export class HeaderPageComponent {
  @Input({ required: true }) titulo!: string;
  @Input() subtitulo = '';
  @Input() textoBoton?: string;
  @Input() icono?: IconosAppType;
  @Input() botonDeshabilitado = false;
  @Input() sizeBoton: SizeBotton = 'mediano';
  @Input() botonAnchoCompleto = false;

  @Output() accion = new EventEmitter<void>();
}
