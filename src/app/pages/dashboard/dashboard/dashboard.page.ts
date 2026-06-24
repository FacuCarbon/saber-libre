import { Component, OnInit } from '@angular/core';

import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class DashboardPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
