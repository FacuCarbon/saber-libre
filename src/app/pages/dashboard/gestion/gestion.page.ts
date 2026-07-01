import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Libro } from '../../../models/libro.model';
import { VolumenGoogleBooks } from '../../../models/google-books.model';
import {
  BackupLocalService,
  ResumenBackupLocal,
} from '../../../services/backup-local.service';
import { LibroService } from '../../../services/libro.service';

@Component({
  selector: 'app-gestion',
  templateUrl: './gestion.page.html',
  styleUrls: ['./gestion.page.scss'],
  standalone: true,
  imports: [FormsModule],
})
export class GestionPage implements OnInit {
  private _libroService = inject(LibroService);
  private _backupLocalService = inject(BackupLocalService);
  busqueda: string = '';
  isbnBusqueda: string = '';
  tituloBusqueda: string = '';
  cantidad: number = 1;

  resultados: VolumenGoogleBooks[] = [];
  libroSeleccionado: VolumenGoogleBooks | null = null;
  librosGuardados: Libro[] = [];

  librosFiltrados: Libro[] = [];

  mensaje = '';
  mensajeBackup = '';
  mensajeBackupEsError = false;
  jsonExportado = '';
  jsonImportacion = '';
  archivoImportadoNombre = '';
  resumenImportacion: ResumenBackupLocal | null = null;
  mostrarConfirmacionImportacion = false;
  procesandoBackup = false;

  async ngOnInit(): Promise<void> {
    await this.cargarLibros();
  }

  async buscarPorIsbn(): Promise<void> {
    this.mensaje = '';
    this.resultados = [];
    this.libroSeleccionado = null;

    try {
      const resultado = await this._libroService.buscarPorIsbn(
        this.isbnBusqueda,
      );

      if (!resultado) {
        this.mensaje = 'No se encontró el libro.';
        return;
      }

      this.libroSeleccionado = resultado;
    } catch (error) {
      console.error(error);
      this.mensaje = 'Error al buscar por ISBN.';
    }
  }

  async buscarPorTitulo(): Promise<void> {
    this.mensaje = '';
    this.resultados = [];
    this.libroSeleccionado = null;

    try {
      this.resultados = await this._libroService.buscarPorTitulo(
        this.tituloBusqueda,
      );

      if (this.resultados.length === 0) {
        this.mensaje = 'No se encontraron libros.';
      }
    } catch (error) {
      console.error(error);
      this.mensaje = 'Error al buscar por título.';
    }
  }

  async buscarLibros(): Promise<Libro[] | null> {
    this.mensaje = '';
    if (this.busqueda.trim() === '') return null;

    const librosEncontrados = await this._libroService.buscarLibro(
      this.busqueda,
    );

    if (librosEncontrados.length === 0) {
      this.mensaje = 'No se encontraron libros.';
      this.librosFiltrados = [];
      return null;
    } else {
      this.librosFiltrados = librosEncontrados;
    }

    return this.librosFiltrados;
  }

  seleccionarLibro(volumen: VolumenGoogleBooks): void {
    this.libroSeleccionado = volumen;
    this.resultados = [];
    this.mensaje = '';
  }

  async guardarLibro(volumen: VolumenGoogleBooks): Promise<void> {
    try {
      const guardado = await this._libroService.guardarLibro(
        volumen,
        this.cantidad,
      );

      if (!guardado) {
        this.mensaje = 'El libro ya está guardado.';
        return;
      }

      this.mensaje = 'Libro guardado correctamente.';
      this.libroSeleccionado = null;
      this.resultados = [];
      this.cantidad = 1;

      await this.cargarLibros();
    } catch (error) {
      console.error(error);
      this.mensaje = 'No se pudo guardar el libro.';
    }
  }

  async cargarLibros(): Promise<void> {
    try {
      this.librosGuardados = await this._libroService.obtenerLibros();
    } catch (error) {
      console.error(error);
      this.mensaje = 'No se pudieron cargar los libros guardados.';
    }
  }

  async exportarDatosLocales(): Promise<void> {
    if (this.procesandoBackup) {
      return;
    }

    this.procesandoBackup = true;
    this.mensajeBackup = '';
    this.mensajeBackupEsError = false;

    try {
      this.jsonExportado = await this._backupLocalService.exportarComoTexto();
      this.descargarJsonExportado();
      this.mostrarMensajeBackup(
        'Backup generado. También podés copiarlo desde el cuadro de texto.',
      );
    } catch (error) {
      console.error(error);
      this.mostrarMensajeBackup('No se pudo exportar el backup.', true);
    } finally {
      this.procesandoBackup = false;
    }
  }

  descargarJsonExportado(): void {
    if (!this.jsonExportado) {
      this.mostrarMensajeBackup('Primero generá un backup.', true);
      return;
    }

    const blob = new Blob([this.jsonExportado], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = this._backupLocalService.obtenerNombreArchivo();
    enlace.click();
    URL.revokeObjectURL(url);
  }

  async copiarJsonExportado(): Promise<void> {
    if (!this.jsonExportado) {
      this.mostrarMensajeBackup('Primero generá un backup.', true);
      return;
    }

    try {
      await navigator.clipboard.writeText(this.jsonExportado);
      this.mostrarMensajeBackup('Backup copiado al portapapeles.');
    } catch (error) {
      console.error(error);
      this.mostrarMensajeBackup(
        'No se pudo copiar automáticamente. Copialo manualmente desde el cuadro.',
        true,
      );
    }
  }

  async cargarArchivoBackup(evento: Event): Promise<void> {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];

    if (!archivo) {
      return;
    }

    try {
      this.jsonImportacion = await archivo.text();
      this.archivoImportadoNombre = archivo.name;
      this.previsualizarImportacion();
    } catch (error) {
      console.error(error);
      this.mostrarMensajeBackup('No se pudo leer el archivo seleccionado.', true);
    } finally {
      input.value = '';
    }
  }

  limpiarPrevisualizacionImportacion(): void {
    this.resumenImportacion = null;
    this.mostrarConfirmacionImportacion = false;
  }

  previsualizarImportacion(): void {
    try {
      const vistaPrevia = this._backupLocalService.previsualizarDesdeTexto(
        this.jsonImportacion,
      );

      this.resumenImportacion = vistaPrevia.resumen;
      this.mostrarConfirmacionImportacion = false;
      this.mostrarMensajeBackup('Backup válido. Revisá el resumen antes de importar.');
    } catch (error) {
      console.error(error);
      this.resumenImportacion = null;
      this.mostrarConfirmacionImportacion = false;
      this.mostrarMensajeBackup(
        error instanceof Error ? error.message : 'El backup no es válido.',
        true,
      );
    }
  }

  solicitarConfirmacionImportacion(): void {
    if (!this.resumenImportacion) {
      this.previsualizarImportacion();
    }

    if (this.resumenImportacion) {
      this.mostrarConfirmacionImportacion = true;
      this.mostrarMensajeBackup(
        'Confirmá la importación para reemplazar los datos locales.',
      );
    }
  }

  cancelarImportacion(): void {
    this.mostrarConfirmacionImportacion = false;
  }

  async confirmarImportacion(): Promise<void> {
    if (this.procesandoBackup) {
      return;
    }

    this.procesandoBackup = true;

    try {
      const resumen = await this._backupLocalService.importarDesdeTexto(
        this.jsonImportacion,
      );

      this.resumenImportacion = resumen;
      this.mostrarConfirmacionImportacion = false;
      await this.cargarLibros();
      this.mostrarMensajeBackup('Datos locales importados correctamente.');
    } catch (error) {
      console.error(error);
      this.mostrarMensajeBackup(
        error instanceof Error ? error.message : 'No se pudo importar el backup.',
        true,
      );
    } finally {
      this.procesandoBackup = false;
    }
  }

  private mostrarMensajeBackup(mensaje: string, esError = false): void {
    this.mensajeBackup = mensaje;
    this.mensajeBackupEsError = esError;
  }
}
