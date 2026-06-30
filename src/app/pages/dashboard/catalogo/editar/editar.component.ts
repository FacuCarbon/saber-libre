import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonAlert,
  IonButton,
  IonIcon,
  IonInput,
  IonTextarea,
} from '@ionic/angular/standalone';
import { GoBackComponent } from 'src/app/components/botones/go-back/go-back.component';
import { HeaderPageComponent } from 'src/app/components/dashboard/header-page/header-page.component';
import { Libro } from 'src/app/models';
import { EjemplarService } from 'src/app/services/ejemplar.service';
import { LibroService } from 'src/app/services/libro.service';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    IonAlert,
    IonButton,
    IonIcon,
    IonInput,
    IonTextarea,
    GoBackComponent,
    HeaderPageComponent,
  ],
})
export class EditarComponent implements OnInit {
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  private _libroService = inject(LibroService);
  private _ejemplarService = inject(EjemplarService);

  idLibro: string | null = this._route.snapshot.paramMap.get('id');
  libroActual: Libro | null = null;

  titulo: string = '';
  autores: string = '';
  categorias: string = '';
  descripcion: string = '';

  cantidadTotal: number = 0;
  cantidadDisponible: number = 0;
  cantidadPrestada: number = 0;
  cantidadMantenimiento: number = 0;

  guardando: boolean = false;
  mensajeError: string | null = null;
  mensajeExito: string | null = null;

  async ngOnInit(): Promise<void> {
    if (!this.idLibro) {
      this.mensajeError = 'No se encontró el libro.';
      return;
    }

    try {
      this.libroActual = await this._libroService.obtenerLibroPorId(
        this.idLibro,
      );

      if (!this.libroActual) {
        this.mensajeError = 'No se encontró el libro.';
        return;
      }

      this.titulo = this.libroActual.titulo;
      this.autores = this.libroActual.autores.join(', ');
      this.categorias = this.libroActual.categorias
        ? this.libroActual.categorias.join(', ')
        : '';
      this.descripcion = this.libroActual.descripcion ?? '';

      const ejemplares = await this._ejemplarService.obtenerEjemplaresPorLibro(
        this.idLibro,
      );
      const ejemplaresActivos = ejemplares.filter(
        (ejemplar) => ejemplar.estadoEjemplar !== 'baja',
      );

      this.cantidadTotal = ejemplaresActivos.length;
      this.cantidadDisponible = ejemplaresActivos.filter(
        (ejemplar) => ejemplar.estadoEjemplar === 'disponible',
      ).length;
      this.cantidadPrestada = ejemplaresActivos.filter(
        (ejemplar) => ejemplar.estadoEjemplar === 'prestado',
      ).length;
      this.cantidadMantenimiento = ejemplaresActivos.filter(
        (ejemplar) => ejemplar.estadoEjemplar === 'mantenimiento',
      ).length;
    } catch (error) {
      console.error(error);
      this.mensajeError = 'No se pudo cargar la información del libro.';
    }
  }

  async guardarCambios(): Promise<void> {
    if (!this.libroActual || this.guardando) {
      return;
    }

    const titulo = this.titulo.trim();
    const autores = this.convertirALista(this.autores);

    if (!titulo) {
      this.mensajeError = 'Ingresá el título del libro.';
      return;
    }

    if (autores.length === 0) {
      this.mensajeError = 'Ingresá al menos un autor.';
      return;
    }

    const libroActualizado: Libro = {
      ...this.libroActual,
      titulo,
      autores,
      categorias: this.convertirALista(this.categorias),
      descripcion: this.descripcion.trim() || undefined,
    };

    this.guardando = true;

    try {
      const actualizado =
        await this._libroService.actualizarLibro(libroActualizado);

      if (!actualizado) {
        this.mensajeError = 'No se pudieron guardar los cambios.';
        return;
      }

      this.libroActual = libroActualizado;
      this.mensajeExito = 'Los cambios se guardaron correctamente.';
    } catch (error) {
      console.error(error);
      this.mensajeError = 'No se pudieron guardar los cambios.';
    } finally {
      this.guardando = false;
    }
  }

  cancelar(): void {
    this._router.navigate(['/dashboard/catalogo']);
  }

  gestionarEjemplares(): void {
    if (!this.idLibro) {
      return;
    }

    this._router.navigate([
      '/dashboard/catalogo',
      this.idLibro,
      'ejemplares',
    ]);
  }

  cerrarMensajeExito(): void {
    this.mensajeExito = null;
    this._router.navigate(['/dashboard/catalogo']);
  }

  private convertirALista(valor: string): string[] {
    return valor
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
}
