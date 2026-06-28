export interface Prestamo {
  id: string;
  idUsuario: string;
  idEjemplar: string;
  fechaPrestamo: string;
  fechaDevEstimada: string;
  fechaDevReal?: string;
  idBibliotecario: string;
}
