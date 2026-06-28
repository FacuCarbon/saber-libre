import { Component } from '@angular/core';
import { User } from '@angular/fire/auth';
import { Router } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { RolUsuario, Usuario } from 'src/app/models';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class DashboardPage {
  constructor(
    private _authService: AuthService,
    private _router: Router,
  ) {}

  usuario: Usuario | null = null;
  rol: RolUsuario | null = null;

  async ionViewWillEnter() {
    this.usuario = await this._authService.usuarioActual();
    this.rol = await this._authService.rolUsuarioActual();
  }

  logout() {
    this._authService.logout();
    this._router.navigate(['/demo']);
  }
}
