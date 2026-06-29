import { Component, OnInit } from '@angular/core';
import { IonImg } from '@ionic/angular/standalone';

@Component({
  selector: 'logo-app',
  templateUrl: './logo-app.component.html',
  styleUrls: ['./logo-app.component.scss'],
  standalone: true,
  imports: [IonImg],
})
export class LogoAppComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
