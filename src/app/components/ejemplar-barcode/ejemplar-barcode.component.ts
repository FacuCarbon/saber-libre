import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import JsBarcode from 'jsbarcode';

@Component({
  selector: 'app-ejemplar-barcode',
  templateUrl: './ejemplar-barcode.component.html',
  styleUrls: ['./ejemplar-barcode.component.scss'],
  standalone: true,
})
export class EjemplarBarcodeComponent implements AfterViewInit, OnChanges {
  @Input({ required: true }) codigo!: string;

  @ViewChild('barcodeSvg', { static: true })
  private _barcodeSvg!: ElementRef<SVGSVGElement>;

  private _vistaLista = false;

  ngAfterViewInit(): void {
    this._vistaLista = true;
    this.renderizarBarcode();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['codigo'] && this._vistaLista) {
      this.renderizarBarcode();
    }
  }

  private renderizarBarcode(): void {
    if (!this.codigo) {
      return;
    }

    JsBarcode(this._barcodeSvg.nativeElement, this.codigo, {
      format: 'CODE128',
      width: 3,
      height: 90,
      fontSize: 16,
      margin: 10,
      displayValue: true,
    });
  }
}
