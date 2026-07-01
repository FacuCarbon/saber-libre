import { Injectable, inject } from '@angular/core';

import {
  AlertaMora,
  Ejemplar,
  Libro,
  Multa,
  Prestamo,
} from '../models';
import {
  EXPORTABLE_STORAGE_KEYS,
  ExportableStorageKey,
  StorageService,
} from './storage.service';

export interface DatosBackupLocal {
  libros: Libro[];
  ejemplares: Ejemplar[];
  prestamos: Prestamo[];
  multas: Multa[];
  alertasMora: AlertaMora[];
}

export interface BackupLocal {
  version: number;
  exportadoEn: string;
  datos: DatosBackupLocal;
}

export interface ResumenBackupLocal {
  libros: number;
  ejemplares: number;
  prestamos: number;
  multas: number;
  alertasMora: number;
}

export interface VistaPreviaBackupLocal {
  backup: BackupLocal;
  resumen: ResumenBackupLocal;
}

@Injectable({
  providedIn: 'root',
})
export class BackupLocalService {
  private _storageService = inject(StorageService);
  private readonly versionActual = 1;

  async exportarBackup(): Promise<BackupLocal> {
    const colecciones = await this._storageService.obtenerColecciones(
      EXPORTABLE_STORAGE_KEYS,
    );

    return {
      version: this.versionActual,
      exportadoEn: new Date().toISOString(),
      datos: this.normalizarDatos(colecciones),
    };
  }

  async exportarComoTexto(): Promise<string> {
    const backup = await this.exportarBackup();
    return JSON.stringify(backup, null, 2);
  }

  previsualizarDesdeTexto(texto: string): VistaPreviaBackupLocal {
    const backup = this.parsearYValidar(texto);
    return {
      backup,
      resumen: this.obtenerResumen(backup.datos),
    };
  }

  async importarDesdeTexto(texto: string): Promise<ResumenBackupLocal> {
    const { backup, resumen } = this.previsualizarDesdeTexto(texto);

    await this._storageService.reemplazarColecciones({
      libros: backup.datos.libros,
      ejemplares: backup.datos.ejemplares,
      prestamos: backup.datos.prestamos,
      multas: backup.datos.multas,
      alertasMora: backup.datos.alertasMora,
    });

    return resumen;
  }

  obtenerNombreArchivo(): string {
    const fecha = new Date().toISOString().slice(0, 10);
    return `saber-libre-backup-${fecha}.json`;
  }

  obtenerResumen(datos: DatosBackupLocal): ResumenBackupLocal {
    return {
      libros: datos.libros.length,
      ejemplares: datos.ejemplares.length,
      prestamos: datos.prestamos.length,
      multas: datos.multas.length,
      alertasMora: datos.alertasMora.length,
    };
  }

  private parsearYValidar(texto: string): BackupLocal {
    const contenido = texto.trim();

    if (!contenido) {
      throw new Error('Pegá o seleccioná un archivo de backup.');
    }

    let valor: unknown;

    try {
      valor = JSON.parse(contenido);
    } catch {
      throw new Error('El backup no es un JSON válido.');
    }

    if (!this.esRegistro(valor)) {
      throw new Error('El backup no tiene el formato esperado.');
    }

    if (valor['version'] !== this.versionActual) {
      throw new Error('La versión del backup no es compatible.');
    }

    const datosOrigen = valor['datos'];
    if (!this.esRegistro(datosOrigen)) {
      throw new Error('El backup no incluye datos para importar.');
    }

    for (const key of EXPORTABLE_STORAGE_KEYS) {
      if (!Array.isArray(datosOrigen[key])) {
        throw new Error(`La colección ${key} no es válida.`);
      }
    }

    const backup: BackupLocal = {
      version: this.versionActual,
      exportadoEn:
        typeof valor['exportadoEn'] === 'string'
          ? valor['exportadoEn']
          : new Date().toISOString(),
      datos: this.normalizarDatos(
        datosOrigen as Record<ExportableStorageKey, unknown[]>,
      ),
    };

    if (backup.datos.libros.length === 0 || backup.datos.ejemplares.length === 0) {
      throw new Error(
        'El backup debe incluir libros y ejemplares para probar el escáner.',
      );
    }

    return backup;
  }

  private normalizarDatos(
    datos: Record<ExportableStorageKey, unknown[]>,
  ): DatosBackupLocal {
    return {
      libros: datos.libros.map((libro) =>
        this.normalizarPortadaLibro(libro as Libro),
      ),
      ejemplares: datos.ejemplares as Ejemplar[],
      prestamos: datos.prestamos as Prestamo[],
      multas: datos.multas as Multa[],
      alertasMora: datos.alertasMora as AlertaMora[],
    };
  }

  private esRegistro(valor: unknown): valor is Record<string, unknown> {
    return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
  }

  private normalizarPortadaLibro(libro: Libro): Libro {
    if (!this.esRegistro(libro)) {
      return libro;
    }

    const imagenPortada = libro.imagenPortada?.replace(
      /^http:\/\//i,
      'https://',
    );

    return {
      ...libro,
      imagenPortada,
    };
  }
}
