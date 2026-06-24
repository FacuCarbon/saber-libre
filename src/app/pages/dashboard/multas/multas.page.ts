import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-multas',
  templateUrl: './multas.page.html',
  styleUrls: ['./multas.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class MultasPage implements OnInit {
  constructor() {}

  ngOnInit() {}
}
