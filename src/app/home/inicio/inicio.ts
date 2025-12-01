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
    // Si el usuario está autenticado, redirigir según su rol
    if (this.authService.authenticated()) {
      const usuario = this.authService.usuario();
      if (usuario && usuario.rol) {
        const rol = usuario.rol.nombre;
        
        // Redirigir según el rol
        switch (rol) {
          case 'ADMIN':
            // Admin puede ver todo, quedarse en inicio
            break;
          case 'TECNICO':
            // Técnico ver sus asignaciones
            this.router.navigate(['/asignaciones']);
            break;
          case 'CLIENTE':
            // Cliente ver sus tiquetes
            this.router.navigate(['/tiquetes']);
            break;
        }
      } else {
        // Si no hay usuario pero hay token, cargar perfil
        this.authService.getUserProfile().subscribe({
          next: (user) => {
            if (user && user.rol) {
              const rol = user.rol.nombre;
              switch (rol) {
                case 'TECNICO':
                  this.router.navigate(['/asignaciones']);
                  break;
                case 'CLIENTE':
                  this.router.navigate(['/tiquetes']);
                  break;
              }
            }
          }
        });
      }
    }
  }
}