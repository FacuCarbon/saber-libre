export interface Libro {
  id: string;
  isbn: string;
  titulo: string;
  autores: string[];
  categorias: string[];
  cantidadTotal: number;
  cantidadDisponible: number;
  activo?: boolean;
  imagenPortada?: string;
  descripcion?: string;
}
