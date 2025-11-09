import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TiqueteService } from '../../share/services/api/tiquete.service';
import { TiqueteListItem } from '../../share/models/TiqueteListModel';
import { NotificationService } from '../../share/services/app/notification.service';
import { Prioridad, EstadoTiquete, RoleNombre } from '../../share/models/EnumsModel';

@Component({
  selector: 'app-tiquete-index',
  standalone: false,
  templateUrl: './tiquete-index.html',
  styleUrl: './tiquete-index.css',
})
export class TiqueteIndex implements OnInit {
  protected readonly tiquetes = signal<TiqueteListItem[]>([]);
  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string>('');
  
  // Variable de ID de usuario (NO EDITABLE en la interfaz)
  // Este valor debe cambiar programáticamente para simular diferentes roles
  protected readonly idUsuarioActivo = signal<number>(1); // 1=Admin, 5=Cliente, 3=Técnico
  protected readonly rolActual = signal<string>('');

  constructor(
    private tiqueteService: TiqueteService,
    private router: Router,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadTiquetes();
  }

  /**
   * Carga los tiquetes según el ID del usuario activo
   * El backend filtra automáticamente según el rol del usuario
   */
  loadTiquetes(): void {
    this.loading.set(true);
    this.error.set('');

    // Llamada al endpoint que filtra por usuario y rol
    this.tiqueteService.getTiquetesPorRol(this.idUsuarioActivo()).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.tiquetes.set(response.data.tiquetes);
          this.rolActual.set(response.data.rol);
          console.log(`Tiquetes cargados para ${response.data.rol}:`, response.data.tiquetes);
        } else {
          this.error.set('Error en la respuesta del servidor');
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar tiquetes:', error);
        this.error.set('Error al conectar con el servidor');
        this.loading.set(false);
        this.notification.error('Error', 'No se pudieron cargar los tiquetes');
      }
    });
  }

  // Método para cambiar de usuario (simular diferentes roles)
  cambiarUsuario(nuevoIdUsuario: number): void {
    this.idUsuarioActivo.set(nuevoIdUsuario);
    this.loadTiquetes();
  }

  verDetalle(id: number): void {
    this.router.navigate(['/tiquetes', id]);
  }

  // Métodos auxiliares para el template
  getPrioridadColor(prioridad: Prioridad): string {
    switch (prioridad) {
      case Prioridad.BAJA: return 'primary';
      case Prioridad.MEDIA: return 'accent';
      case Prioridad.ALTA: return 'warn';
      case Prioridad.CRITICA: return 'error';
      default: return 'basic';
    }
  }

  getPrioridadIcon(prioridad: Prioridad): string {
    switch (prioridad) {
      case Prioridad.BAJA: return 'arrow_downward';
      case Prioridad.MEDIA: return 'remove';
      case Prioridad.ALTA: return 'arrow_upward';
      case Prioridad.CRITICA: return 'priority_high';
      default: return 'help';
    }
  }

  getEstadoColor(estado: EstadoTiquete): string {
    switch (estado) {
      case EstadoTiquete.ABIERTO: return 'warn';
      case EstadoTiquete.ASIGNADO: return 'accent';
      case EstadoTiquete.EN_PROGRESO: return 'primary';
      case EstadoTiquete.PENDIENTE: return 'warn';
      case EstadoTiquete.RESUELTO: return 'success';
      case EstadoTiquete.CERRADO: return 'basic';
      case EstadoTiquete.CANCELADO: return 'error';
      default: return 'basic';
    }
  }

  getEstadoIcon(estado: EstadoTiquete): string {
    switch (estado) {
      case EstadoTiquete.ABIERTO: return 'inbox';
      case EstadoTiquete.ASIGNADO: return 'assignment_ind';
      case EstadoTiquete.EN_PROGRESO: return 'hourglass_empty';
      case EstadoTiquete.PENDIENTE: return 'schedule';
      case EstadoTiquete.RESUELTO: return 'check_circle';
      case EstadoTiquete.CERRADO: return 'done_all';
      case EstadoTiquete.CANCELADO: return 'cancel';
      default: return 'help';
    }
  }

  formatearFecha(fecha: Date | string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatearFechaHora(fecha: Date | string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  retry(): void {
    this.loadTiquetes();
  }

  getTituloSegunRol(): string {
    switch (this.rolActual()) {
      case 'ADMIN': return 'Todos los Tickets';
      case 'CLIENTE': return 'Mis Tickets';
      case 'TECNICO': return 'Tickets Asignados';
      default: return 'Lista de Tickets';
    }
  }

  getSubtituloSegunRol(): string {
    switch (this.rolActual()) {
      case 'ADMIN': return 'Vista completa del sistema';
      case 'CLIENTE': return 'Tickets creados por ti';
      case 'TECNICO': return 'Tickets asignados a tu cargo';
      default: return 'Gestión de tickets';
    }
  }
}