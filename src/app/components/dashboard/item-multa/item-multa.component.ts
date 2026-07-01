import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { MultaDetalle } from 'src/app/models';

@Component({
  selector: 'app-item-multa',
  templateUrl: './item-multa.component.html',
  styleUrls: ['./item-multa.component.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon],
})
export class ItemMultaComponent {
  @Input({ required: true }) detalle!: MultaDetalle;

  @Output() marcarPagada = new EventEmitter<string>();
}
