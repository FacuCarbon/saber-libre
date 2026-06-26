import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.page.html',
  styleUrls: ['./demo.page.scss'],
  standalone: true,
  imports: [FormsModule, IonicModule],
})
export class DemoPage {
  constructor(
    private _authService: AuthService,
    private _router: Router,
  ) {}

  ionViewWillEnter() {
    this.email = '';
    this.password = '';
    this.error = '';
    this.mensajeConfirmacion = '';
  }

  email: string = '';
  password: string = '';
  nombreCompleto: string = '';
  error: string = '';
  mensajeConfirmacion: string = '';

  async login() {
    try {
      this.mensajeConfirmacion = '';
      this.error = '';

      if (this.email.trim() === '' || this.password.trim() === '') {
        throw new Error('El email y la contraseña son requeridos.');
      }

      await this._authService.iniciarSesion(this.email, this.password);

      this._router.navigate(['/dashboard']);
    } catch {
      this.error =
        'Ocurrió un error al iniciar sesión, verifique sus credenciales.';
    }
  }

  async registrarCuenta() {
    try {
      this.mensajeConfirmacion = '';
      this.error = '';

      if (this.nombreCompleto.trim() === '') {
        throw new Error('El nombre completo es requerido.');
      }
      if (this.email.trim() === '' || this.password.trim() === '') {
        throw new Error('El email y la contraseña son requeridos.');
      }

      await this._authService.registrar(
        this.email,
        this.password,
        this.nombreCompleto,
      );

      this.mensajeConfirmacion =
        'Verifique su correo electrónico para activar su cuenta.';

      this.email = '';
      this.password = '';
    } catch {
      this.error =
        'Error desconocido al registrar al usuario, por favor comuniquese con un administrador del sitio.';
    }
  }

  async iniciarSesionGoogle() {
    try {
      await this._authService.iniciarSesionGoogle();

      this._router.navigate(['/dashboard']);
    } catch {
      this.error =
        'Ocurrió un error al iniciar sesión con Google, por favor intentelo nuevamente.';
    }
  }
}
