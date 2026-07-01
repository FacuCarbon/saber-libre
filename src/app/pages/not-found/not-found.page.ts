import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { LogoAppComponent } from 'src/app/components/logo-app/logo-app.component';
import { BotonAccionComponent } from 'src/app/components/botones/boton-accion/boton-accion.component';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.page.html',
  styleUrls: ['./not-found.page.scss'],
  standalone: true,
  imports: [IonContent, LogoAppComponent, BotonAccionComponent],
})
export class NotFoundPage {
  private router = inject(Router);

  irACatalogo() {
    this.router.navigate(['/demo']);
  }

  irAInicio() {
    this.router.navigate(['/']);
  }
}
