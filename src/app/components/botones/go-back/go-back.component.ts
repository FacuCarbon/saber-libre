import { Component, Input } from '@angular/core';
import { IonButton, NavController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-go-back',
  templateUrl: './go-back.component.html',
  styleUrls: ['./go-back.component.scss'],
  standalone: true,
  imports: [IonButton],
})
export class GoBackComponent {
  @Input() texto: string = 'Volver';
  @Input() ruta: string | null = null;

  constructor(private _navegacionController: NavController) {}

  onAction() {
    if (this.ruta) {
      this._navegacionController.navigateBack(this.ruta);
    } else {
      this._navegacionController.back();
    }
  }
}
