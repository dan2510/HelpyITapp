import { Component, signal, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('app');

  ngOnInit(): void {
    // Inicialización de la aplicación
  }
}
