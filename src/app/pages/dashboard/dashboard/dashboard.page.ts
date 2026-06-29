import { Component } from '@angular/core';

import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { SidebarMenuComponent } from 'src/app/components/dashboard/sidebar-menu/sidebar-menu.component';
import { LogoAppComponent } from 'src/app/components/logo-app/logo-app.component';
import { RolUsuario, Usuario } from 'src/app/models';
import { AuthService } from 'src/app/services/auth.service';
import { NavegacionService } from 'src/app/services/navegacion.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    SidebarMenuComponent,
    RouterLink,
    RouterLinkActive,
    LogoAppComponent,
    RouterOutlet,
  ],
})
export class DashboardPage {
  constructor(
    private _authService: AuthService,
    private _router: Router,
    private _navegacionService: NavegacionService,
  ) {}
  tituloPaginaActual: string = 'Dashboard';
  usuario: Usuario | null = null;
  rol: RolUsuario | null = null;

  rutas = this._navegacionService.dashboardMenu;
  rutasTabs = this.rutas.filter((item) => item.mobile === 'tab');
  rutasMas = this.rutas.filter((item) => item.mobile === 'more');
  masActivo = false;

  async ionViewWillEnter() {
    this.usuario = await this._authService.usuarioActual();
    this.rol = await this._authService.rolUsuarioActual();
  }

  actualizarPaginaActual(): void {
    const urlActual = this._router.url.split('?')[0].split('#')[0];
    this.tituloPaginaActual =
      this.rutas.find((item) => item.url === urlActual)?.title ?? 'Dashboard';
    this.masActivo = this.rutasMas.some((item) => item.url === urlActual);
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

      await this._router.navigateByUrl('/demo', {
        replaceUrl: true,
      });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}
