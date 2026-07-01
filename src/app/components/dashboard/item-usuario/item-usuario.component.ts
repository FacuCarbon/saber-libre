import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';
import { RolUsuario, Usuario } from 'src/app/models';

export interface CambioRol {
  idUsuario: string;
  nuevoRol: RolUsuario;
}

@Component({
  selector: 'app-item-usuario',
  templateUrl: './item-usuario.component.html',
  styleUrls: ['./item-usuario.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonButton, IonSelect, IonSelectOption],
})
export class ItemUsuarioComponent implements OnChanges {
  @Input({ required: true }) usuario!: Usuario;
  @Input() esUsuarioActual = false;
  @Input() esUnicoAdministrador = false;
  @Input() guardando = false;

  @Output() cambiarRol = new EventEmitter<CambioRol>();

  rolSeleccionado: RolUsuario = 'lector';

  ngOnChanges(): void {
    this.rolSeleccionado = this.usuario.rol;
  }

  get deshabilitado(): boolean {
    return this.esUsuarioActual || this.esUnicoAdministrador;
  }

  get huboCambio(): boolean {
    return this.rolSeleccionado !== this.usuario.rol;
  }

  guardar(): void {
    if (this.deshabilitado || !this.huboCambio) {
      return;
    }

    this.cambiarRol.emit({
      idUsuario: this.usuario.id,
      nuevoRol: this.rolSeleccionado,
    });
  }
}
