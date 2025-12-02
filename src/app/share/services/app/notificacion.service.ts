import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { NotificacionModel, EstadoNotificacion } from '../../models/NotificacionModel';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class NotificacionService {
  private http = inject(HttpClient);
  private readonly apiURL = `${environment.apiURL}/notificaciones`;
  private readonly tokenKey = 'currentUser';

  /**
   * Signal principal con el estado de las notificaciones
   * Se inicializa vacío y se carga desde el servidor
   */
  private notificaciones = signal<NotificacionModel[]>([]);

  /**
   * Observable reactivo: lista completa de notificaciones
   */
  readonly allNotificaciones = computed(() => this.notificaciones());

  /**
   * Notificaciones no leídas
   */
  readonly notificacionesNoLeidas = computed(() =>
    this.notificaciones().filter(n => n.estado === EstadoNotificacion.NO_LEIDA)
  );

  /**
   * Cantidad de notificaciones no leídas
   */
  readonly cantidadNoLeidas = computed(() => this.notificacionesNoLeidas().length);

  /**
   * Notificaciones ordenadas por fecha (más recientes primero)
   */
  readonly notificacionesOrdenadas = computed(() =>
    [...this.notificaciones()].sort((a, b) => {
      const fechaA = new Date(a.creadaen).getTime();
      const fechaB = new Date(b.creadaen).getTime();
      return fechaB - fechaA; // Más recientes primero
    })
  );

  constructor() {
    // No cargar notificaciones en el constructor
    // Se cargarán cuando el usuario esté autenticado
  }

  /**
   * Verificar si el usuario está autenticado
   * Sin crear dependencia circular con AuthenticationService
   */
  private isAuthenticated(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  /**
   * Cargar notificaciones desde el servidor
   * Solo carga si el usuario está autenticado
   */
  cargarNotificaciones(): void {
    // Solo cargar si el usuario está autenticado
    if (!this.isAuthenticated()) {
      return;
    }

    this.http.get<{ success: boolean; data: NotificacionModel[] }>(this.apiURL)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.notificaciones.set(response.data);
          }
        },
        error: (error) => {
          // Solo loguear errores que no sean 401 (no autenticado)
          if (error.status !== 401) {
            console.error('Error al cargar notificaciones:', error);
          }
        }
      });
  }

  /**
   * Marcar una notificación como leída
   */
  marcarComoLeida(id: number): Observable<any> {
    return this.http.patch<{ success: boolean; data: NotificacionModel }>(
      `${this.apiURL}/${id}/leer`,
      {}
    ).pipe(
      tap((response) => {
        if (response.success) {
          // Actualizar la notificación en el estado local
          this.notificaciones.update(notificaciones =>
            notificaciones.map(n =>
              n.id === id ? { ...n, estado: EstadoNotificacion.LEIDA, leidaen: new Date().toISOString() } : n
            )
          );
        }
      })
    );
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  marcarTodasComoLeidas(): Observable<any> {
    return this.http.patch<{ success: boolean }>(
      `${this.apiURL}/marcar-todas-leidas`,
      {}
    ).pipe(
      tap((response) => {
        if (response.success) {
          // Actualizar todas las notificaciones en el estado local
          this.notificaciones.update(notificaciones =>
            notificaciones.map(n => ({
              ...n,
              estado: EstadoNotificacion.LEIDA,
              leidaen: n.leidaen || new Date().toISOString()
            }))
          );
        }
      })
    );
  }

  /**
   * Agregar una nueva notificación al estado local (para actualizaciones en tiempo real)
   */
  agregarNotificacion(notificacion: NotificacionModel): void {
    this.notificaciones.update(notificaciones => [notificacion, ...notificaciones]);
  }

  /**
   * Actualizar el estado completo de notificaciones
   */
  actualizarNotificaciones(notificaciones: NotificacionModel[]): void {
    this.notificaciones.set(notificaciones);
  }
}

