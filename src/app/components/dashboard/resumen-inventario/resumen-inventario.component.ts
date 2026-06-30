import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-resumen-inventario',
  templateUrl: './resumen-inventario.component.html',
  styleUrls: ['./resumen-inventario.component.scss'],
  standalone: true,
})
export class ResumenInventarioComponent {
  @Input({ required: true }) titulo!: string;
  @Input() eyebrow = 'Inventario real';
  @Input() nota = '';
  @Input({ required: true }) total!: number;
  @Input({ required: true }) disponibles!: number;
  @Input({ required: true }) prestados!: number;
  @Input({ required: true }) mantenimiento!: number;
  @Input({ required: true }) baja!: number;
}
