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
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
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
export class LoginPage {
  email: string = '';
  password: string = '';
  error: string | null = null;

  constructor(
    private _authService: AuthService,
    private _router: Router,
  ) {}

  async login(): Promise<void> {
    this.error = null;

    if (!this.email.trim() || !this.password.trim()) {
      this.error = 'Completá todos los campos.';
      return;
    }

    try {
      await this._authService.iniciarSesion(this.email, this.password);
      this._router.navigate(['/dashboard/catalogo']);
    } catch (err: unknown) {
      this.error = err instanceof Error ? err.message : 'Error al iniciar sesión.';
    }
  }

  async loginGoogle(): Promise<void> {
    this.error = null;

    try {
      await this._authService.iniciarSesionGoogle();
      this._router.navigate(['/dashboard/catalogo']);
    } catch (err: unknown) {
      this.error = err instanceof Error ? err.message : 'Error al iniciar sesión con Google.';
    }
  }
}

