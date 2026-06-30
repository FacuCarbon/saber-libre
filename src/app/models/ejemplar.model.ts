export type EstadoEjemplar =
  | 'disponible'
  | 'prestado'
  | 'mantenimiento'
  | 'baja';

export interface Ejemplar {
  id: string;
  idLibro: string;
  codigoBarras: string;
  estadoEjemplar: EstadoEjemplar;
  ubicacion: string;
}
