import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment.development';
import { AuthenticationService } from '../../share/services/app/authentication.service';
import { NotificationService } from '../../share/services/app/notification.service';
import { NotificacionService } from '../../share/services/app/notificacion.service';
import { TranslateService } from '@ngx-translate/core';
import { TranslationService } from '../../share/services/app/translation.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  private notificacionService = inject(NotificacionService);
  private translate = inject(TranslateService);
  private translationService = inject(TranslationService);

  // Contador de notificaciones para el badge
  readonly cantidadNotificaciones = this.notificacionService.cantidadNoLeidas;

  // Idioma actual
  currentLanguage = signal<string>('es');

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
    // Cargar idioma guardado
    const savedLanguage = localStorage.getItem('language') || 'es';
    this.currentLanguage.set(savedLanguage);
    this.translate.use(savedLanguage);

    // Solo cargar notificaciones si el usuario está autenticado
    // Evitar recargas innecesarias que causen parpadeo
    if (this.authService.authenticated()) {
      // Si no hay usuario pero hay token, cargar el perfil primero
      if (!this.usuario()) {
        this.authService.getUserProfile().subscribe({
          next: () => {
            // Recargar notificaciones después de cargar el perfil
            // Solo si no se han cargado ya
            if (this.notificacionService.allNotificaciones().length === 0) {
              this.notificacionService.cargarNotificaciones();
            }
          }
        });
      } else {
        // Si ya hay usuario, cargar notificaciones solo si no se han cargado
        if (this.notificacionService.allNotificaciones().length === 0) {
          this.notificacionService.cargarNotificaciones();
        }
      }
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
    return this.translationService.translateRole(rol);
  }

  // Cambiar idioma
  changeLanguage(lang: string): void {
    this.translate.use(lang);
    this.currentLanguage.set(lang);
    localStorage.setItem('language', lang);
  }

  // Obtener idioma actual
  getCurrentLanguage(): string {
    return this.currentLanguage();
  }

  // Verificar si el idioma es español
  isSpanish(): boolean {
    return this.currentLanguage() === 'es';
  }
}