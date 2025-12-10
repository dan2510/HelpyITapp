import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../share/services/app/authentication.service';

@Component({
  selector: 'app-inicio',
  standalone: false,
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class Inicio implements OnInit {
  
  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Ya no redirigimos automáticamente - permitimos que todos los usuarios vean la página de inicio
    // La redirección automática solo ocurre después del login (manejado en user-login.ts)
    // Los usuarios pueden navegar libremente usando el menú de navegación
  }
}