import { Component, Input } from '@angular/core';
import { IonButton, IonIcon, NavController } from '@ionic/angular/standalone';
import { IconosAppType } from 'src/app/iconos.config';

@Component({
  selector: 'app-go-back',
  templateUrl: './go-back.component.html',
  styleUrls: ['./go-back.component.scss'],
  imports: [IonIcon, IonButton],
})
export class GoBackComponent {
  @Input() texto: string = 'Volver';
  @Input() icono?: IconosAppType = 'arrow-back';
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
