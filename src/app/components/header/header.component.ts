import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import {
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
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonIcon,
    IonSpinner,
    IonPopover,
    IonList,
    IonItem,
    IonLabel,
    RouterLink,
    RouterLinkActive,
    LogoAppComponent,
  ],
})
export class HeaderComponent implements OnInit {
  private auth = inject(Auth);
  private authService = inject(AuthService);
  private router = inject(Router);

  usuario: Usuario | null = null;
  rol: RolUsuario | null = null;
  cargando = true;
  popoverAbierto = false;
  popoverEvent: Event | null = null;

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

  get esLector(): boolean {
    return this.rol === 'lector';
  }

  togglePopover(ev: Event) {
    this.popoverEvent = ev;
    this.popoverAbierto = !this.popoverAbierto;
  }

  cerrarPopover() {
    this.popoverAbierto = false;
  }

  async irADashboard() {
    this.cerrarPopover();
    await this.router.navigate(['/dashboard']);
  }

  async irALector() {
    this.cerrarPopover();
    await this.router.navigate(['/lector']);
  }

  async irACatalogo() {
    this.cerrarPopover();
    await this.router.navigate(['/catalogo']);
  }

  async irAPerfil() {
    this.cerrarPopover();
    await this.router.navigate(['/perfil']);
  }

  async cerrarSesion() {
    this.cerrarPopover();
    await this.authService.logout();
    this.usuario = null;
    this.rol = null;
    await this.router.navigate(['/']);
  }
}
