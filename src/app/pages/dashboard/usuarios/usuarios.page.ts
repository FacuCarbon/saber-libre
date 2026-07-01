import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonSpinner,
} from '@ionic/angular/standalone';
import { BuscadorLibrosComponent } from 'src/app/components/buscador-libros/buscador-libros.component';
import { HeaderPageComponent } from 'src/app/components/dashboard/header-page/header-page.component';
import {
  CambioRol,
  ItemUsuarioComponent,
} from 'src/app/components/dashboard/item-usuario/item-usuario.component';
import { RolUsuario, Usuario } from 'src/app/models';
import { AuthService } from 'src/app/services/auth.service';
import { PerfilUsuarioService } from 'src/app/services/perfil-usuario.service';

type FiltroRol = 'todos' | RolUsuario;

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BuscadorLibrosComponent,
    HeaderPageComponent,
    ItemUsuarioComponent,
    IonIcon,
    IonSelect,
    IonSelectOption,
    IonSpinner,
  ],
})
export class UsuariosPage implements OnInit {
  private _authService = inject(AuthService);
  private _perfilUsuarioService = inject(PerfilUsuarioService);

  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];
  filtroRol: FiltroRol = 'todos';
  busquedaActual = '';
  cargando = true;
  idProcesando: string | null = null;
  idUsuarioActual: string | null = null;
  mensaje = '';
  mensajeEsError = false;

  get cantidadAdministradores(): number {
    return this.usuarios.filter((usuario) => usuario.rol === 'administrador')
      .length;
  }

  async ngOnInit(): Promise<void> {
    await this.cargarUsuarios();
  }

  filtrarUsuarios(busqueda: string): void {
    this.busquedaActual = busqueda;
    this.aplicarFiltros();
  }

  cambiarFiltroRol(): void {
    this.aplicarFiltros();
  }

  esUnicoAdministrador(usuario: Usuario): boolean {
    return usuario.rol === 'administrador' && this.cantidadAdministradores <= 1;
  }

  async guardarRol({ idUsuario, nuevoRol }: CambioRol): Promise<void> {
    if (this.idProcesando) {
      return;
    }

    const usuario = this.usuarios.find((item) => item.id === idUsuario);
    if (!usuario) {
      return;
    }

    if (idUsuario === this.idUsuarioActual) {
      this.mostrarMensaje('No podés editar tu propio rol.', true);
      return;
    }

    if (this.esUnicoAdministrador(usuario) && nuevoRol !== 'administrador') {
      this.mostrarMensaje(
        'No podés quitarle el rol al único administrador del sistema.',
        true,
      );
      return;
    }

    this.idProcesando = idUsuario;
    this.mensaje = '';

    try {
      await this._perfilUsuarioService.actualizarPerfil(idUsuario, {
        rol: nuevoRol,
      });
      await this.cargarUsuarios();
      this.mostrarMensaje('Rol actualizado correctamente.');
    } catch (error) {
      console.error(error);
      this.mostrarMensaje('No se pudo actualizar el rol.', true);
    } finally {
      this.idProcesando = null;
    }
  }

  private async cargarUsuarios(): Promise<void> {
    this.cargando = true;

    try {
      const [usuarios, usuarioActual] = await Promise.all([
        this._authService.obtenerUsuarios(),
        this._authService.usuarioActual(),
      ]);

      this.idUsuarioActual = usuarioActual?.id ?? null;
      this.usuarios = [...usuarios].sort((a, b) =>
        a.nombreCompleto.localeCompare(b.nombreCompleto),
      );
      this.aplicarFiltros();
    } catch (error) {
      console.error(error);
      this.mostrarMensaje('No se pudieron cargar los usuarios.', true);
    } finally {
      this.cargando = false;
    }
  }

  private aplicarFiltros(): void {
    const busqueda = this.busquedaActual.toLowerCase().trim();

    this.usuariosFiltrados = this.usuarios.filter((usuario) => {
      const coincideRol =
        this.filtroRol === 'todos' || usuario.rol === this.filtroRol;

      if (!coincideRol) {
        return false;
      }

      if (!busqueda) {
        return true;
      }

      return (
        usuario.nombreCompleto.toLowerCase().includes(busqueda) ||
        usuario.email.toLowerCase().includes(busqueda)
      );
    });
  }

  private mostrarMensaje(mensaje: string, esError = false): void {
    this.mensaje = mensaje;
    this.mensajeEsError = esError;
  }
}
