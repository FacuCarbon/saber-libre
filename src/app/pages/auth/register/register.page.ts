import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    CommonModule,
    FormsModule,
    RouterLink,
  ],
})
export class RegisterPage {
  nombreCompleto: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  error: string | null = null;

  constructor(
    private _authService: AuthService,
    private _router: Router,
  ) {}

  async register(): Promise<void> {
    this.error = null;

    if (!this.nombreCompleto.trim() || !this.email.trim() || !this.password.trim() || !this.confirmPassword.trim()) {
      this.error = 'Completá todos los campos.';
      return;
    }

    if (this.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }

    try {
      await this._authService.registrar(this.email, this.password, this.nombreCompleto);
      this._router.navigate(['/auth/login']);
    } catch (err: unknown) {
      this.error = err instanceof Error ? err.message : 'Error al registrarse.';
    }
  }

  async registerGoogle(): Promise<void> {
    this.error = null;

    try {
      await this._authService.iniciarSesionGoogle();
      this._router.navigate(['/dashboard/catalogo']);
    } catch (err: unknown) {
      this.error = err instanceof Error ? err.message : 'Error al registrarse con Google.';
    }
  }
}
