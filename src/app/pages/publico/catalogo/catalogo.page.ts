import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { IonContent } from '@ionic/angular/standalone';
import { HeaderComponent } from '../../../components/header/header.component';
import { FiltrosCatalogoComponent } from '../../../components/filtros-catalogo/filtros-catalogo.component';
import { TarjetaLibroLectorComponent } from '../../../components/tarjeta-libro-lector/tarjeta-libro-lector.component';
import { LibroService } from '../../../services/libro.service';
import { Libro } from '../../../models/libro.model';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [
    IonContent,
    HeaderComponent,
    FiltrosCatalogoComponent,
    TarjetaLibroLectorComponent,
  ],
  templateUrl: './catalogo.page.html',
  styleUrl: './catalogo.page.scss',
})
export class CatalogoPage implements OnInit {
  private libroService = inject(LibroService);
  private router = inject(Router);
  private auth = inject(Auth);

  libros: Libro[] = [];
  librosFiltrados: Libro[] = [];
  categorias: string[] = [];
  busqueda = '';
  categoriaSeleccionada = '';
  disponibilidadSeleccionada = '';
  usuarioLogueado = false;

  ngOnInit() {
    onAuthStateChanged(this.auth, async (user) => {
      this.usuarioLogueado = !!user;
      this.libros = await this.libroService.obtenerLibros();
      this.libros = this.libros.filter((l) => l.activo !== false);
      const todasCategorias = this.libros.reduce<string[]>(
        (acc, libro) => acc.concat(libro.categorias),
        [],
      );
      this.categorias = [...new Set(todasCategorias)].sort();
      this.filtrar();
    });
  }

  filtrar() {
    this.librosFiltrados = this.libros.filter((libro) => {
      const q = this.busqueda.toLowerCase();
      const matchBusqueda =
        !this.busqueda ||
        libro.titulo.toLowerCase().includes(q) ||
        libro.autores.some((a) => a.toLowerCase().includes(q)) ||
        libro.isbn.includes(this.busqueda);
      const matchCategoria =
        !this.categoriaSeleccionada ||
        libro.categorias.includes(this.categoriaSeleccionada);
      const matchDisponibilidad =
        !this.disponibilidadSeleccionada ||
        (this.disponibilidadSeleccionada === 'disponible' &&
          libro.cantidadDisponible > 0) ||
        (this.disponibilidadSeleccionada === 'no-disponible' &&
          libro.cantidadDisponible === 0);
      return matchBusqueda && matchCategoria && matchDisponibilidad;
    });
  }

  onBusqueda(value: string) {
    this.busqueda = value;
    this.filtrar();
  }

  onCategoria(value: string) {
    this.categoriaSeleccionada = value;
    this.filtrar();
  }

  onDisponibilidad(value: string) {
    this.disponibilidadSeleccionada = value;
    this.filtrar();
  }

  onSeleccionarLibro(id: string) {
    this.router.navigate(['/catalogo', id]);
  }

  onLimpiarCategoria() {
    this.categoriaSeleccionada = '';
    this.filtrar();
  }

  onLimpiarDisponibilidad() {
    this.disponibilidadSeleccionada = '';
    this.filtrar();
  }
}
