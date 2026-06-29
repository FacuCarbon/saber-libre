import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BuscadorLibrosComponent } from 'src/app/components/buscador-libros/buscador-libros.component';
import { HeaderPageComponent } from 'src/app/components/dashboard/header-page/header-page.component';
import { LibroCatalogoItemComponent } from 'src/app/components/dashboard/libro-catalogo-item/libro-catalogo-item.component';
import { Libro } from 'src/app/models';
import { LibroService } from 'src/app/services/libro.service';

@Component({
  selector: 'app-catalogo',
  templateUrl: './catalogo.page.html',
  styleUrls: ['./catalogo.page.scss'],
  standalone: true,
  imports: [
    BuscadorLibrosComponent,
    HeaderPageComponent,
    LibroCatalogoItemComponent,
  ],
})
export class CatalogoPage implements OnInit {
  private _libroService = inject(LibroService);
  private _router = inject(Router);

  libros: Libro[] = [];
  librosFiltrados: Libro[] = [];

  async ngOnInit(): Promise<void> {
    this.libros = await this._libroService.obtenerLibros();
    this.librosFiltrados = [...this.libros];
  }

  filtrarLibros(query: string): void {
    if (!query) {
      this.librosFiltrados = [...this.libros];
      return;
    }

    const busqueda = query.toLowerCase().trim();

    this.librosFiltrados = this.libros.filter((libro) => {
      const tituloCoincide = libro.titulo
        .toLowerCase()
        .trim()
        .includes(busqueda);

      const isbnCoincide = libro.isbn.toLowerCase().trim().includes(busqueda);

      const autorCoincide = libro.autores.some((autor) =>
        autor.toLowerCase().trim().includes(busqueda),
      );

      return tituloCoincide || isbnCoincide || autorCoincide;
    });
  }

  agregarLibro(): void {
    this._router.navigate(['/dashboard/catalogo/agregar']);
  }

  verLibro(id: string): void {
    this._router.navigate(['/dashboard/catalogo/detalle', id]);
  }

  editarLibro(id: string): void {
    this._router.navigate(['/dashboard/catalogo/editar', id]);
  }

  abrirGestionEjemplares(id: string): void {
    console.log('Gestionar ejemplares:', id);
  }

  solicitarEliminarLibro(id: string): void {
    console.log('Solicitar eliminación:', id);
  }
}
