import { Component, OnInit, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { NotificacionService } from '../../share/services/app/notificacion.service';
import { NotificacionModel, TipoNotificacion, EstadoNotificacion } from '../../share/models/NotificacionModel';
import { NotificationService } from '../../share/services/app/notification.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-notificaciones-panel',
  standalone: false,
  templateUrl: './notificaciones-panel.html',
  styleUrl: './notificaciones-panel.css'
})
export class NotificacionesPanel implements OnInit {
  private notificacionService = inject(NotificacionService);
  private router = inject(Router);
  private notification = inject(NotificationService);
  private translate = inject(TranslateService);

  readonly notificaciones = computed(() => this.notificacionService.notificacionesOrdenadas());
  readonly cantidadNoLeidas = computed(() => this.notificacionService.cantidadNoLeidas());

  ngOnInit(): void {
    // Cargar notificaciones al inicializar
    this.notificacionService.cargarNotificaciones();
    
    // Recargar notificaciones cada 30 segundos para mantenerlas actualizadas
    setInterval(() => {
      if (this.notificacionService) {
        this.notificacionService.cargarNotificaciones();
      }
    }, 30000);
  }

  getIconoTipo(tipo: TipoNotificacion): string {
    switch (tipo) {
      case TipoNotificacion.CAMBIO_ESTADO:
        return 'swap_horiz';
      case TipoNotificacion.ASIGNACION:
        return 'assignment_ind';
      case TipoNotificacion.INICIO_SESION:
        return 'login';
      case TipoNotificacion.MENSAJE:
        return 'message';
      case TipoNotificacion.RECORDATORIO:
        return 'notifications_active';
      default:
        return 'notifications';
    }
  }

  getColorTipo(tipo: TipoNotificacion): string {
    switch (tipo) {
      case TipoNotificacion.CAMBIO_ESTADO:
        return 'primary';
      case TipoNotificacion.ASIGNACION:
        return 'accent';
      case TipoNotificacion.INICIO_SESION:
        return 'primary';
      case TipoNotificacion.MENSAJE:
        return 'warn';
      case TipoNotificacion.RECORDATORIO:
        return 'accent';
      default:
        return '';
    }
  }

  formatearFecha(fecha: Date | string): string {
    const date = new Date(fecha);
    const ahora = new Date();
    const diffMs = ahora.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const currentLang = this.translate.currentLang || 'es';

    if (diffMins < 1) {
      return this.translate.instant('NOTIFICATIONS.TIME.JUST_NOW');
    }
    
    if (diffMins < 60) {
      const key = diffMins === 1 ? 'NOTIFICATIONS.TIME.MINUTE_AGO' : 'NOTIFICATIONS.TIME.MINUTES_AGO';
      return this.translate.instant(key, { minutes: diffMins });
    }
    
    if (diffHours < 24) {
      const key = diffHours === 1 ? 'NOTIFICATIONS.TIME.HOUR_AGO' : 'NOTIFICATIONS.TIME.HOURS_AGO';
      return this.translate.instant(key, { hours: diffHours });
    }
    
    if (diffDays < 7) {
      const key = diffDays === 1 ? 'NOTIFICATIONS.TIME.DAY_AGO' : 'NOTIFICATIONS.TIME.DAYS_AGO';
      return this.translate.instant(key, { days: diffDays });
    }
    
    const locale = currentLang === 'en' ? 'en-US' : 'es-ES';
    return date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== ahora.getFullYear() ? 'numeric' : undefined
    });
  }

  esNoLeida(estado: EstadoNotificacion): boolean {
    return estado === EstadoNotificacion.NO_LEIDA;
  }

  marcarComoLeida(notificacion: NotificacionModel, event: Event): void {
    event.stopPropagation();
    
    if (notificacion.estado === EstadoNotificacion.LEIDA) {
      return; // Ya está leída
    }

    this.notificacionService.marcarComoLeida(notificacion.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.notification.success(
            this.translate.instant('NOTIFICATIONS.TITLE'),
            this.translate.instant('NOTIFICATIONS.NOTIFICATION_MARKED')
          );
        }
      },
      error: (error) => {
        console.error('Error al marcar notificación como leída:', error);
        this.notification.error(
          this.translate.instant('COMMON.ERROR'),
          this.translate.instant('NOTIFICATIONS.ERROR_MARKING')
        );
      }
    });
  }

  marcarTodasComoLeidas(): void {
    if (this.cantidadNoLeidas() === 0) {
      return;
    }

    this.notificacionService.marcarTodasComoLeidas().subscribe({
      next: (response) => {
        if (response.success) {
          this.notification.success(
            this.translate.instant('NOTIFICATIONS.TITLE'),
            this.translate.instant('NOTIFICATIONS.ALL_MARKED_READ')
          );
        }
      },
      error: (error) => {
        console.error('Error al marcar todas como leídas:', error);
        this.notification.error(
          this.translate.instant('COMMON.ERROR'),
          this.translate.instant('NOTIFICATIONS.ERROR_MARKING_ALL')
        );
      }
    });
  }

  abrirNotificacion(notificacion: NotificacionModel): void {
    // Marcar como leída si no lo está
    if (notificacion.estado === EstadoNotificacion.NO_LEIDA) {
      this.marcarComoLeida(notificacion, new Event('click'));
    }

    // Navegar según el tipo de notificación
    if (notificacion.tiquete && notificacion.idtiquete) {
      this.router.navigate(['/tiquetes', notificacion.idtiquete]);
    }
  }

  tieneNotificaciones(): boolean {
    return this.notificaciones().length > 0;
  }
}

