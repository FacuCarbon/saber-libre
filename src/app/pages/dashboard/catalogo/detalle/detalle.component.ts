import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.component.html',
  styleUrls: ['./detalle.component.scss'],
  standalone: true,
})
export class DetalleComponent implements OnInit {
  private _route = inject(ActivatedRoute);
  constructor() {}
  idLibro = this._route.snapshot.paramMap.get('id');
  ngOnInit() {
    console.log('ID libro ', this.idLibro);
  }
}
