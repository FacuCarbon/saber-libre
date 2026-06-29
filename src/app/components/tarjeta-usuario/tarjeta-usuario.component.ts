import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';


import { Usuario } from 'src/app/models/usuario.model';


import {IonCardContent, IonCard, IonCardHeader, IonCardTitle, IonAvatar, IonInput} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-tarjeta-usuario',
  standalone: true,
  imports: [CommonModule, IonCard, IonCardHeader, IonCardTitle, IonInput, IonAvatar, FormsModule, IonCardContent],
  templateUrl: './tarjeta-usuario.component.html',
  styleUrls: ['./tarjeta-usuario.component.scss'],
})
export class TarjetaUsuarioComponent {


  @Input( {required: true} ) usuario!: Usuario; //!indica a ts que angular lo inicializara


  @Input( {required: true} ) tituloBoton!: string;


  @Input( {required: true} ) iconoBoton!: string;


  @Output() botonClick = new EventEmitter<void>();


  onBotonClick(): void {
    this.botonClick.emit();
  }


    get iniciales(): string {
      if (!this.usuario?.nombreCompleto) {
        return '';
      }


      const nombres = this.usuario.nombreCompleto.trim().split(' ');


      if (nombres.length === 1) {
        return nombres[0][0].toUpperCase();
      }


      return (
        nombres[0][0] + nombres[nombres.length - 1][0]).toUpperCase();
    }




}
