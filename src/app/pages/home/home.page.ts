import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import {
  IonContent,
  IonButton,
  IonIcon,
  IonSpinner,
  IonPopover,
  IonList,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';
import { LogoAppComponent } from 'src/app/components/logo-app/logo-app.component';
import { AuthService } from 'src/app/services/auth.service';
import { RolUsuario, Usuario } from 'src/app/models';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonButton,
    IonIcon,
    IonSpinner,
    IonPopover,
    IonList,
    IonItem,
    IonLabel,
    RouterLink,
    LogoAppComponent,
  ],
})
export class HomePage implements OnInit {
  private auth = inject(Auth);
  private authService = inject(AuthService);
  private router = inject(Router);

  usuario: Usuario | null = null;
  rol: RolUsuario | null = null;
  cargando = true;

  ngOnInit() {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        this.usuario = await this.authService.usuarioActual();
        this.rol = await this.authService.rolUsuarioActual();
      } else {
        this.usuario = null;
        this.rol = null;
      }
      this.cargando = false;
    });
  }

  get puedeVerDashboard(): boolean {
    return this.rol === 'administrador' || this.rol === 'bibliotecario';
  }

  async irADashboard() {
    await this.router.navigate(['/dashboard']);
  }

  async irAPerfil() {
    await this.router.navigate(['/dashboard/perfil']);
  }

  async cerrarSesion() {
    await this.authService.logout();
    this.usuario = null;
    this.rol = null;
  }
}
