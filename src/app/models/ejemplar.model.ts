export type EstadoEjemplar = 'disponible' | 'prestado' | 'mantenimiento';

export interface Ejemplar {
  id: string;
  idLibro: string;
  codigoBarras: string;
  estadoEjemplar: EstadoEjemplar;
  ubicacion: string;
}
