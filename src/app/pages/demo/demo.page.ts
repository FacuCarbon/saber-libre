import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { StorageService } from 'src/app/services/storage.service';
import { Libro } from 'src/app/models';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.page.html',
  styleUrls: ['./demo.page.scss'],
  standalone: true,
  imports: [FormsModule, IonicModule],
})
export class DemoPage implements OnInit {
  constructor(private _storageService: StorageService) {}

  ngOnInit() {
    this.listarLibros();
  }

  libros: Libro[] = [];

  titulo: string = '';
  autores: string[] = [];
  nuevaAutor: string = '';
  isbn: string = '';
  cantidadDisponible: number = 0;
  cantidadTotal: number = 0;
  categorias: string[] = [];
  nuevaCategoria: string = '';
  imagenPortada: string = '';
  descripcion: string = '';

  agregarCategoria() {
    if (this.nuevaCategoria.trim() !== '') {
      this.categorias = [...this.categorias, this.nuevaCategoria.trim()];
      this.nuevaCategoria = '';
    }
  }

  eliminarCategoria(index: number) {
    this.categorias.splice(index, 1);
  }

  agregarAutor() {
    if (this.nuevaAutor.trim() !== '') {
      this.autores = [...this.autores, this.nuevaAutor.trim()];
      this.nuevaAutor = '';
      console.log('autores: ', this.autores);
    }
  }

  eliminarAutor(index: number) {
    this.autores.splice(index, 1);
  }

  async listarLibros() {
    const respuesta = await this._storageService.obtenerLista<Libro>('libros');
    this.libros = respuesta;
  }

  async guardarLibro() {
    const nuevoLibro: Libro = {
      id: crypto.randomUUID(),
      titulo: this.titulo,
      autores: this.autores,
      isbn: this.isbn,
      cantidadDisponible: this.cantidadDisponible,
      cantidadTotal: this.cantidadTotal,
      categorias: this.categorias,
      imagenPortada: this.imagenPortada,
      descripcion: this.descripcion,
    };

    const resultado = await this._storageService.guardar<Libro>(
      'libros',
      nuevoLibro,
    );
    if (resultado) {
      console.log('Libro guardado exitosamente');
      this.listarLibros();
    } else {
      console.log('El libro ya existe');
    }
  }
}
