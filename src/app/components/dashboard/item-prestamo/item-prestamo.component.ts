import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { PrestamoDetalle } from 'src/app/models';

@Component({
  selector: 'app-item-prestamo',
  templateUrl: './item-prestamo.component.html',
  styleUrls: ['./item-prestamo.component.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon],
})
export class ItemPrestamoComponent {
  @Input({ required: true }) detalle!: PrestamoDetalle;

  @Output() procesarDevolucion = new EventEmitter<string>();
}
