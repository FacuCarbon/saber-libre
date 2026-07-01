import { Component, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonLabel,
  IonList,
  IonMenu,
  IonPopover,
  IonSplitPane,
  IonTabBar,
  IonTabButton,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { SidebarMenuComponent } from 'src/app/components/dashboard/sidebar-menu/sidebar-menu.component';
import { LogoAppComponent } from 'src/app/components/logo-app/logo-app.component';
import { BotonAccionComponent } from 'src/app/components/botones/boton-accion/boton-accion.component';
import { RolUsuario, Usuario } from 'src/app/models';
import { AuthService } from 'src/app/services/auth.service';
import { NavegacionService, NavItem } from 'src/app/services/navegacion.service';

@Component({
  selector: 'app-lector',
  templateUrl: './lector.page.html',
  styleUrls: ['./lector.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonFooter,
    IonHeader,
    IonIcon,
    IonLabel,
    IonList,
    IonMenu,
    IonPopover,
    IonSplitPane,
    IonTabBar,
    IonTabButton,
    IonTitle,
    IonToolbar,
    SidebarMenuComponent,
    RouterLink,
    RouterLinkActive,
    LogoAppComponent,
    RouterOutlet,
    BotonAccionComponent,
  ],
})
export class LectorPage {
  constructor(
    private _authService: AuthService,
    private _router: Router,
    private _navegacionService: NavegacionService,
  ) {}

  tituloPaginaActual = 'Catálogo';
  usuario: Usuario | null = null;
  rol: RolUsuario | null = null;

  todasLasRutas = this._navegacionService.lectorMenu;
  rutas: NavItem[] = [];
  rutasTabs: NavItem[] = [];
  rutasMas: NavItem[] = [];
  masActivo = false;
  esDesktop = window.innerWidth >= 992;

  async ionViewWillEnter(): Promise<void> {
    this.usuario = await this._authService.usuarioActual();
    this.rol = await this._authService.rolUsuarioActual();
    this.filtrarRutas();
  }

  private filtrarRutas(): void {
    this.rutas = this.todasLasRutas.filter((item) => {
      if (!item.rolesPermitidos) {
        return true;
      }
      return this.rol && item.rolesPermitidos.includes(this.rol);
    });
    this.rutasTabs = this.rutas.filter((item) => item.mobile === 'tab');
    this.rutasMas = this.rutas.filter((item) => item.mobile === 'more');
  }

  @HostListener('window:resize')
  actualizarVistaResponsive(): void {
    this.esDesktop = window.innerWidth >= 992;
  }

  actualizarPaginaActual(): void {
    const urlActual = this._router.url.split('?')[0].split('#')[0];
    this.tituloPaginaActual =
      this.rutas.find((item) => this.rutaCoincide(item, urlActual))?.title ?? 'Mi espacio';
    this.masActivo = this.rutasMas.some((item) =>
      this.rutaCoincide(item, urlActual),
    );
  }

  private rutaCoincide(item: NavItem, urlActual: string): boolean {
    if (item.exact === false) {
      return urlActual === item.url || urlActual.startsWith(`${item.url}/`);
    }
    return urlActual === item.url;
  }

  mostrarSaludo() {
    const horaActual = new Date().getHours();
    if (horaActual >= 5 && horaActual < 12) {
      return 'Buenos días';
    }
    if (horaActual >= 12 && horaActual < 18) {
      return 'Buenas tardes';
    }
    return 'Buenas noches';
  }

  async logout(): Promise<void> {
    try {
      await this._authService.logout();
      await this._router.navigateByUrl('/', { replaceUrl: true });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}
