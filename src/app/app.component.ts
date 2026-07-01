import { Component } from '@angular/core';
import { NavigationEnd, NavigationCancel, NavigationError, NavigationStart, Router } from '@angular/router';
import { IonApp, IonRouterOutlet, IonSpinner } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrl: 'app.component.scss',
  imports: [IonApp, IonRouterOutlet, IonSpinner],
})
export class AppComponent {
  navegando = false;

  constructor(router: Router) {
    router.events.subscribe((evento) => {
      if (evento instanceof NavigationStart) {
        this.navegando = true;
      } else if (
        evento instanceof NavigationEnd ||
        evento instanceof NavigationCancel ||
        evento instanceof NavigationError
      ) {
        this.navegando = false;
      }
    });
  }
}
