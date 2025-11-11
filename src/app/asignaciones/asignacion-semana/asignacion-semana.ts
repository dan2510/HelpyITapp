import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AsignacionService } from '../../share/services/api/asignacion.service';
import { AsignacionItem } from '../../share/models/AsignacionTiqueteModel';
import { NotificationService } from '../../share/services/app/notification.service';
import { EstadoTiquete, Prioridad } from '../../share/models/EnumsModel';

interface DiaAsignaciones {
  fecha: Date;
  diaNombre: string;
  tickets: AsignacionItem[];
}

@Component({
  selector: 'app-asignacion-semana',
  standalone: false,
  templateUrl: './asignacion-semana.html',
  styleUrl: './asignacion-semana.css',
})
export class AsignacionSemana implements OnInit {
  // ID del técnico
  private readonly ID_TECNICO = 2; // Carlos Rodríguez

  protected readonly asignaciones = signal<AsignacionItem[]>([]);
  protected readonly diasSemana = signal<DiaAsignaciones[]>([]);
  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly semanaActual = signal<{ inicio: Date; fin: Date } | null>(null);
  protected readonly tecnicoNombre = signal<string>('');

  constructor(
    private asignacionService: AsignacionService,
    private router: Router,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadAsignaciones();
  }

  loadAsignaciones(): void {
    this.loading.set(true);
    this.error.set('');

    this.asignacionService.getAsignacionesPorSemana(this.ID_TECNICO).subscribe({
      next: (response) => {
        if (response.success) {
          this.asignaciones.set(response.data.asignaciones);
          this.semanaActual.set(response.data.semana);
          this.tecnicoNombre.set(response.data.tecnico.nombrecompleto);
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
        this.notification.error('Error', 'No se pudieron cargar las asignaciones');
      }
    });
  }

  organizarPorDias(tickets: AsignacionItem[], semana: { inicio: Date; fin: Date }): void {
    const dias: DiaAsignaciones[] = [];
    const inicio = new Date(semana.inicio);
    
    // Crear 7 días de la semana
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(inicio);
      fecha.setDate(inicio.getDate() + i);
      
      // Filtrar tickets de este día
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

  // Métodos auxiliares para colores y estilos
  getEstadoColor(estado: EstadoTiquete): string {
    switch (estado) {
      case EstadoTiquete.ABIERTO: return 'warn';
      case EstadoTiquete.ASIGNADO: return 'accent';
      case EstadoTiquete.EN_PROGRESO: return 'primary';
      case EstadoTiquete.PENDIENTE: return 'warn';
      case EstadoTiquete.RESUELTO: return 'success';
      case EstadoTiquete.CERRADO: return 'basic';
      default: return 'basic';
    }
  }

  getPrioridadColor(prioridad: Prioridad): string {
    switch (prioridad) {
      case Prioridad.BAJA: return 'primary';
      case Prioridad.MEDIA: return 'accent';
      case Prioridad.ALTA: return 'warn';
      case Prioridad.CRITICA: return 'error';
      default: return 'basic';
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