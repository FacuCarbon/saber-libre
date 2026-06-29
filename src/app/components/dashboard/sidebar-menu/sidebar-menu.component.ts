import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IonItem, IonList, IonIcon, IonLabel } from '@ionic/angular/standalone';
import { NavegacionService } from 'src/app/services/navegacion.service';

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss'],
  standalone: true,
  imports: [IonItem, IonList, IonIcon, IonLabel, RouterLink, RouterLinkActive],
})
export class SidebarMenuComponent implements OnInit {
  constructor(private _navegacionService: NavegacionService) {}

  ngOnInit() {}
  rutas = this._navegacionService.dashboardMenu;
}
