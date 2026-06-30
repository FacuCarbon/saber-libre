import { Ejemplar } from './ejemplar.model';
import { Libro } from './libro.model';
import { Usuario } from './usuario.model';

export interface Prestamo {
  id: string;
  idUsuario: string;
  idEjemplar: string;
  fechaPrestamo: string;
  fechaDevEstimada: string;
  fechaDevReal?: string;
  idBibliotecario: string;
}

export type EstadoPrestamo = 'activo' | 'vencido' | 'devuelto';

export interface PrestamoDetalle {
  prestamo: Prestamo;
  usuario: Usuario | null;
  ejemplar: Ejemplar | null;
  libro: Libro | null;
  estado: EstadoPrestamo;
}
