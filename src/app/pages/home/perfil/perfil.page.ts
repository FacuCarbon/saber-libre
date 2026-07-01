import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule, ToastController } from '@ionic/angular';

import { TarjetaUsuarioComponent } from 'src/app/components/tarjeta-usuario/tarjeta-usuario.component';
import { ResumenActividadComponent } from 'src/app/components/resumen-actividad/resumen-actividad.component';

import { AuthService } from 'src/app/services/auth.service';
import { Usuario } from 'src/app/models/usuario.model';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { HeaderPageComponent } from 'src/app/components/dashboard/header-page/header-page.component';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TarjetaUsuarioComponent,
    ResumenActividadComponent,
    HeaderComponent,
    HeaderPageComponent,
  ],
})
export class PerfilPage {
  private _authService = inject(AuthService);
  private _toastController = inject(ToastController);

  usuario: Usuario | null = null;
  guardando = false;

  prestamosActivos: number = 2;
  librosLeidos: number = 0;
  multasPendientes: number = 0;
  miembroDesde: string = ' junio 2026';

  async ionViewWillEnter(): Promise<void> {
    this.usuario = await this._authService.usuarioActual();
  }

  async guardarCambios(): Promise<void> {
    if (!this.usuario || this.guardando) {
      return;
    }

    this.guardando = true;

    try {
      this.usuario = await this._authService.actualizarUsuarioActual({
        nombreCompleto: this.usuario.nombreCompleto,
        telefono: this.usuario.telefono,
      });
      await this.mostrarMensaje('Datos actualizados correctamente.', 'success');
    } catch (error) {
      console.error(error);
      await this.mostrarMensaje(
        error instanceof Error
          ? error.message
          : 'No se pudieron guardar los cambios.',
        'danger',
      );
    } finally {
      this.guardando = false;
    }
  }

  private async mostrarMensaje(
    mensaje: string,
    color: 'success' | 'danger',
  ): Promise<void> {
    const toast = await this._toastController.create({
      message: mensaje,
      duration: 2200,
      color,
      position: 'bottom',
    });
    await toast.present();
  }
}
