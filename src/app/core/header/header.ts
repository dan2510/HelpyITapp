import { Component, OnInit, computed } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment.development';
import { AuthenticationService } from '../../share/services/app/authentication.service';
import { NotificationService } from '../../share/services/app/notification.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  // Contador de notificaciones para el badge
  notificationCount = 3; // Puedes conectar esto con un servicio real

  // URL del logo - el servidor sirve las imágenes desde /images que apunta a assets/uploads
  logoUrl = `${environment.apiURL}/images/helpyIT.jpg`;

  // Usuario autenticado
  usuario = computed(() => this.authService.usuario());
  authenticated = computed(() => this.authService.authenticated());
  rolUsuario = computed(() => {
    const user = this.usuario();
    return user?.rol?.nombre || '';
  });

  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    // Si hay token pero no hay usuario, cargar el perfil
    if (this.authService.authenticated() && !this.usuario()) {
      this.authService.getUserProfile().subscribe();
    }
  }

  onLogoError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  // Verificar si el usuario tiene un rol específico
  tieneRol(rol: string): boolean {
    return this.rolUsuario() === rol;
  }

  // Verificar si el usuario es admin
  esAdmin(): boolean {
    return this.tieneRol('ADMIN');
  }

  // Verificar si el usuario es técnico
  esTecnico(): boolean {
    return this.tieneRol('TECNICO');
  }

  // Verificar si el usuario es cliente
  esCliente(): boolean {
    return this.tieneRol('CLIENTE');
  }

  // Cerrar sesión
  logout(): void {
    this.authService.logout();
    this.notification.success('Sesión cerrada', 'Has cerrado sesión correctamente');
    this.router.navigate(['/usuario/login']);
  }

  // Obtener iniciales del usuario
  getIniciales(): string {
    const user = this.usuario();
    if (user && user.nombrecompleto) {
      const nombres = user.nombrecompleto.split(' ');
      if (nombres.length >= 2) {
        return (nombres[0][0] + nombres[1][0]).toUpperCase();
      }
      return user.nombrecompleto.substring(0, 2).toUpperCase();
    }
    return 'U';
  }

  // Obtener nombre completo del usuario
  getNombreCompleto(): string {
    const user = this.usuario();
    return user?.nombrecompleto || 'Usuario';
  }

  // Obtener nombre del rol
  getNombreRol(): string {
    const rol = this.rolUsuario();
    switch (rol) {
      case 'ADMIN': return 'Administrador';
      case 'TECNICO': return 'Técnico';
      case 'CLIENTE': return 'Cliente';
      default: return 'Usuario';
    }
  }
}