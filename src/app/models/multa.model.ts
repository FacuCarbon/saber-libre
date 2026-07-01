import { Libro } from './libro.model';
import { Prestamo } from './prestamo.model';
import { Usuario } from './usuario.model';

export interface Multa {
  id: string;
  idUsuario: string;
  idPrestamo: string;
  monto: number;
  pagada: boolean;
}

export interface MultaDetalle {
  multa: Multa;
  usuario: Usuario | null;
  prestamo: Prestamo | null;
  libro: Libro | null;
}
