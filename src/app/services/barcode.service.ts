import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  BarcodeFormat,
  BarcodeScanner,
} from '@capacitor-mlkit/barcode-scanning';

@Injectable({
  providedIn: 'root',
})
export class BarcodeService {
  /**
   * Indica si la aplicación se está ejecutando como aplicación nativa Android.
   * @returns true cuando la plataforma actual es Android nativo.
   */
  esAndroidNativo(): boolean {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
  }

  /**
   * Abre el lector nativo y devuelve el primer código encontrado.
   * @returns El código leído o null si se canceló el escaneo.
   */
  async escanearCodigo(): Promise<string | null> {
    if (!this.esAndroidNativo()) {
      throw new Error('El escáner con cámara solo está disponible en Android.');
    }

    const soporte = await BarcodeScanner.isSupported();
    if (!soporte.supported) {
      throw new Error('Este dispositivo no permite escanear códigos.');
    }

    const modulo = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
    if (!modulo.available) {
      await BarcodeScanner.installGoogleBarcodeScannerModule();
      throw new Error(
        'Se está instalando el lector. Esperá unos segundos y volvé a intentarlo.',
      );
    }

    const resultado = await BarcodeScanner.scan({
      formats: [
        BarcodeFormat.Code39,
        BarcodeFormat.Code93,
        BarcodeFormat.Code128,
        BarcodeFormat.Codabar,
        BarcodeFormat.Ean8,
        BarcodeFormat.Ean13,
        BarcodeFormat.Itf,
        BarcodeFormat.QrCode,
        BarcodeFormat.UpcA,
        BarcodeFormat.UpcE,
      ],
      autoZoom: true,
    });

    const codigo =
      resultado.barcodes[0]?.rawValue ??
      resultado.barcodes[0]?.displayValue ??
      '';

    return codigo.trim() || null;
  }
}
