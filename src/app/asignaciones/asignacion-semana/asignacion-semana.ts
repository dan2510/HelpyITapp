// src/app/asignaciones/asignacion-semana/asignacion-semana.ts
import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AsignacionService } from '../../share/services/api/asignacion.service';
import { NotificationService } from '../../share/services/app/notification.service';
import { AuthenticationService } from '../../share/services/app/authentication.service';
import { EstadoTiquete, Prioridad } from '../../share/models/EnumsModel';

interface DiaAsignaciones {
  fecha: Date;
  diaNombre: string;
  tickets: any[]; // Sin tipado estricto
}

@Component({
  selector: 'app-asignacion-semana',
  standalone: false,
  templateUrl: './asignacion-semana.html',
  styleUrl: './asignacion-semana.css',
})
export class AsignacionSemana implements OnInit {
  protected readonly asignaciones = signal<any[]>([]);
  protected readonly diasSemana = signal<DiaAsignaciones[]>([]);
  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly semanaActual = signal<{ inicio: Date; fin: Date } | null>(null);
  protected readonly tecnicoNombre = signal<string>('');

  constructor(
    private asignacionService: AsignacionService,
    private router: Router,
    private notification: NotificationService,
    private authService: AuthenticationService
  ) {}

  ngOnInit(): void {
    // Verificar autenticación y que sea técnico o admin
    if (!this.authService.authenticated()) {
      this.router.navigate(['/usuario/login']);
      return;
    }

    const usuario = this.authService.usuario();
    if (usuario && usuario.rol && usuario.rol.nombre !== 'TECNICO' && usuario.rol.nombre !== 'ADMIN') {
      this.notification.warning('Acceso Restringido', 'Solo los técnicos y administradores pueden ver asignaciones');
      this.router.navigate(['/inicio']);
      return;
    }

    if (usuario) {
      if (usuario.rol?.nombre === 'ADMIN') {
        this.tecnicoNombre.set('Todas las Asignaciones');
      } else {
        this.tecnicoNombre.set(usuario.nombrecompleto);
      }
    }

    this.loadAsignaciones();
  }

  loadAsignaciones(): void {
    this.loading.set(true);
    this.error.set('');

    // Usar la nueva ruta que obtiene asignaciones del técnico autenticado
    this.asignacionService.getAsignacionesPorSemana().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.asignaciones.set(response.data.asignaciones);
          this.semanaActual.set(response.data.semana);
          if (response.data.tecnico) {
            this.tecnicoNombre.set(response.data.tecnico.nombrecompleto);
          }
          this.organizarPorDias(response.data.asignaciones, response.data.semana);
          console.log('Asignaciones cargadas:', response.data.asignaciones);
        } else {
          this.error.set('Error en la respuesta del servidor');
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar asignaciones:', error);
        this.error.set('No se pudieron cargar las asignaciones');
        this.loading.set(false);
        if (error.status === 401) {
          this.notification.error('Error', 'Debe iniciar sesión');
          this.router.navigate(['/usuario/login']);
        } else if (error.status === 403) {
          this.notification.error('Error', 'Solo los técnicos y administradores pueden ver asignaciones');
          this.router.navigate(['/inicio']);
        } else {
          this.notification.error('Error', 'No se pudieron cargar las asignaciones');
        }
      }
    });
  }

  organizarPorDias(tickets: any[], semana: { inicio: Date; fin: Date }): void {
    const dias: DiaAsignaciones[] = [];
    const inicio = new Date(semana.inicio);
    
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(inicio);
      fecha.setDate(inicio.getDate() + i);
      
      const ticketsDelDia = tickets.filter(ticket => {
        const ticketFecha = new Date(ticket.creadoen);
        return ticketFecha.toDateString() === fecha.toDateString();
      });

      dias.push({
        fecha: fecha,
        diaNombre: this.getNombreDia(fecha.getDay()),
        tickets: ticketsDelDia
      });
    }

    this.diasSemana.set(dias);
  }

  getNombreDia(dia: number): string {
    const nombres = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return nombres[dia];
  }

  verDetalle(idTicket: number): void {
    this.router.navigate(['/tiquetes', idTicket]);
  }

  getEstadoColor(estado: EstadoTiquete | string): string {
    const estadoStr = typeof estado === 'string' ? estado.toUpperCase() : estado;
    switch (estadoStr) {
      case EstadoTiquete.ASIGNADO:
      case 'ASIGNADO': return 'asignado';
      case EstadoTiquete.EN_PROGRESO:
      case 'EN_PROGRESO': return 'en-progreso';
      case EstadoTiquete.PENDIENTE:
      case 'PENDIENTE': return 'pendiente';
      case EstadoTiquete.RESUELTO:
      case 'RESUELTO': return 'resuelto';
      case EstadoTiquete.CERRADO:
      case 'CERRADO': return 'cerrado';
      case EstadoTiquete.CANCELADO:
      case 'CANCELADO': return 'cancelado';
      default: return 'pendiente';
    }
  }

  getPrioridadColor(prioridad: Prioridad | string): string {
    const prioridadStr = typeof prioridad === 'string' ? prioridad.toUpperCase() : prioridad;
    switch (prioridadStr) {
      case Prioridad.BAJA:
      case 'BAJA': return 'baja';
      case Prioridad.MEDIA:
      case 'MEDIA': return 'media';
      case Prioridad.ALTA:
      case 'ALTA': return 'alta';
      case Prioridad.CRITICA:
      case 'CRITICA': return 'critica';
      default: return 'media';
    }
  }

  getSLAColor(estadoSLA: string): string {
    switch (estadoSLA) {
      case 'OK': return 'success';
      case 'ADVERTENCIA': return 'warn';
      case 'CRITICO': return 'error';
      default: return 'basic';
    }
  }

  getSLAIcon(estadoSLA: string): string {
    switch (estadoSLA) {
      case 'OK': return 'check_circle';
      case 'ADVERTENCIA': return 'warning';
      case 'CRITICO': return 'error';
      default: return 'help';
    }
  }

  getCategoriaIcon(categoria: string): string {
    const icons: { [key: string]: string } = {
      'Incidente Crítico': 'report_problem',
      'Falla de Sistema': 'bug_report',
      'Problema de Red': 'wifi_off',
      'Error de Software': 'code_off',
      'Solicitud de Acceso': 'vpn_key',
      'Capacitación': 'school',
      'Consulta General': 'help',
      'Mantenimiento Preventivo': 'build',
      'Instalación de Software': 'download'
    };
    return icons[categoria] || 'confirmation_number';
  }

  formatearFecha(fecha: Date): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short'
    });
  }

  retry(): void {
    this.loadAsignaciones();
  }
}