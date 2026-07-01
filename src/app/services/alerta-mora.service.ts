import { Injectable, inject } from '@angular/core';

import { AlertaMora } from '../models';
import { PrestamoService } from './prestamo.service';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class AlertaMoraService {
  private _storageService = inject(StorageService);
  private _prestamoService = inject(PrestamoService);

  obtenerAlertas(): Promise<AlertaMora[]> {
    return this._storageService.obtenerLista<AlertaMora>('alertasMora');
  }

  async sincronizarAlertas(): Promise<AlertaMora[]> {
    const [alertas, prestamosVencidos] = await Promise.all([
      this.obtenerAlertas(),
      this._prestamoService.obtenerPrestamosVencidos(),
    ]);
    const idsVencidos = new Set(prestamosVencidos.map((prestamo) => prestamo.id));

    for (const prestamo of prestamosVencidos) {
      const alertaExistente = alertas.find(
        (alerta) => alerta.idPrestamo === prestamo.id,
      );

      if (!alertaExistente) {
        const nuevaAlerta: AlertaMora = {
          id: crypto.randomUUID(),
          idPrestamo: prestamo.id,
          fechaGeneracion: new Date().toISOString(),
          activa: true,
        };
        await this._storageService.guardar<AlertaMora>(
          'alertasMora',
          nuevaAlerta,
        );
        alertas.push(nuevaAlerta);
      } else if (!alertaExistente.activa) {
        alertaExistente.activa = true;
        alertaExistente.fechaGeneracion = new Date().toISOString();
        await this._storageService.actualizar<AlertaMora>(
          'alertasMora',
          alertaExistente,
        );
      }
    }

    for (const alerta of alertas) {
      if (alerta.activa && !idsVencidos.has(alerta.idPrestamo)) {
        alerta.activa = false;
        await this._storageService.actualizar<AlertaMora>(
          'alertasMora',
          alerta,
        );
      }
    }

    return alertas
      .filter((alerta) => alerta.activa)
      .sort(
        (a, b) =>
          new Date(b.fechaGeneracion).getTime() -
          new Date(a.fechaGeneracion).getTime(),
      );
  }
}
