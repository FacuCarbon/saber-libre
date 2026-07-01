import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import {
  IonContent,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { LogoAppComponent } from 'src/app/components/logo-app/logo-app.component';
import { AuthService } from 'src/app/services/auth.service';
import { Usuario } from 'src/app/models';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonButton,
    IonIcon,
    RouterLink,
    HeaderComponent,
    LogoAppComponent,
  ],
})
export class HomePage implements OnInit {
  private auth = inject(Auth);
  private authService = inject(AuthService);

  usuario: Usuario | null = null;

  ngOnInit() {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        this.usuario = await this.authService.usuarioActual();
      } else {
        this.usuario = null;
      }
    });
  }
}
