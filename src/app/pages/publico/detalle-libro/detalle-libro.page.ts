import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { IonContent, IonIcon, IonButton } from '@ionic/angular/standalone';
import { HeaderComponent } from '../../../components/header/header.component';
import { LibroService } from '../../../services/libro.service';
import { AuthService } from '../../../services/auth.service';
import { Libro } from '../../../models/libro.model';

@Component({
  selector: 'app-detalle-libro',
  standalone: true,
  imports: [IonContent, IonIcon, IonButton, HeaderComponent, RouterLink],
  templateUrl: './detalle-libro.page.html',
  styleUrl: './detalle-libro.page.scss',
})
export class DetalleLibroPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private libroService = inject(LibroService);
  private auth = inject(Auth);
  private authService = inject(AuthService);

  libro: Libro | null = null;
  usuarioLogueado = false;

  ngOnInit() {
    onAuthStateChanged(this.auth, async (user) => {
      this.usuarioLogueado = !!user;
      const id = this.route.snapshot.paramMap.get('id');
      if (id) {
        this.libro = await this.libroService.obtenerLibroPorId(id);
      }
    });
  }

  volver() {
    this.router.navigate(['/catalogo']);
  }
}
