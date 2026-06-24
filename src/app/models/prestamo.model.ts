export interface Prestamo {
  id: string;
  idUsuario: string;
  codigoBarras: string;
  fechaPrestamo: string;
  fechaDevEstimada: string;
  fechaDevReal?: string;
  idBibliotecario: string;
}
