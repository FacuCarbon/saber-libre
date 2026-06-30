import { Component, Input } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-libro-resumen',
  templateUrl: './libro-resumen.component.html',
  styleUrls: ['./libro-resumen.component.scss'],
  standalone: true,
  imports: [IonIcon],
})
export class LibroResumenComponent {
  @Input({ required: true }) titulo!: string;
  @Input() autores: string[] = [];
  @Input({ required: true }) isbn!: string;
  @Input() categorias: string[] = [];
  @Input() imagenPortada: string | null | undefined = null;
  @Input() descripcion: string | null | undefined = null;
  @Input() eyebrow = 'Ficha bibliográfica';
  @Input() estadoTexto: string | null | undefined = null;
  @Input() estadoInactivo = false;
}
