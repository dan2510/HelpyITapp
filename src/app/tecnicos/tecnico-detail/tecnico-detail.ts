// src/app/tecnicos/tecnico-detail/tecnico-detail.ts
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TecnicoService } from '../../share/services/api/tecnico.service';
import { UsuarioModel } from '../../share/models/UsuarioModel';
import { NotificationService } from '../../share/services/app/notification.service';
import { Disponibilidad, NivelExperiencia } from '../../share/models/EnumsModel';

@Component({
  selector: 'app-tecnico-detail',
  standalone: false,
  templateUrl: './tecnico-detail.html',
  styleUrl: './tecnico-detail.css',
})
export class TecnicoDetail implements OnInit {
  protected readonly tecnico = signal<UsuarioModel | null>(null);
  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly tecnicoId = signal<number>(0);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tecnicoService: TecnicoService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = parseInt(params['id']);
      if (id && !isNaN(id)) {
        this.tecnicoId.set(id);
        this.loadTecnicoDetail(id);
      } else {
        this.error.set('ID de técnico inválido');
        this.notification.error('Error', 'ID de técnico inválido');
      }
    });
  }

  loadTecnicoDetail(id: number): void {
    this.loading.set(true);
    this.error.set('');

    this.tecnicoService.getById(id).subscribe({
      next: (response: any) => {
        // El backend devuelve { success: true, data: { tecnico: {...} } }
        if (response.success && response.data && response.data.tecnico) {
          this.tecnico.set(response.data.tecnico);
          console.log('Detalle del técnico cargado:', response.data.tecnico);
        } else if (response.id) {
          // Si el backend devuelve directamente el objeto técnico
          this.tecnico.set(response);
        } else {
          this.error.set('Error en la respuesta del servidor');
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar detalle del técnico:', error);
        this.error.set('No se pudo cargar la información del técnico');
        this.loading.set(false);
        this.notification.error('Error', 'No se pudo cargar la información del técnico');
      }
    });
  }

  regresarAlListado(): void {
    this.router.navigate(['/tecnicos']);
  }

  editarTecnico(): void {
    if (this.tecnicoId() > 0) {
      this.router.navigate(['/tecnicos/editar', this.tecnicoId()]);
    }
  }

  retry(): void {
    if (this.tecnicoId() > 0) {
      this.loadTecnicoDetail(this.tecnicoId());
    }
  }

  // Métodos auxiliares
  getDisponibilidadColor(disponibilidad: Disponibilidad): string {
    switch (disponibilidad) {
      case Disponibilidad.DISPONIBLE: return 'success-color';
      case Disponibilidad.OCUPADO: return 'warning-color';
      case Disponibilidad.AUSENTE: return 'error-color';
      case Disponibilidad.INACTIVO: return 'error-color';
      default: return 'neutral-color';
    }
  }

  getDisponibilidadIcon(disponibilidad: Disponibilidad): string {
    switch (disponibilidad) {
      case Disponibilidad.DISPONIBLE: return 'check_circle';
      case Disponibilidad.OCUPADO: return 'schedule';
      case Disponibilidad.AUSENTE: return 'cancel';
      case Disponibilidad.INACTIVO: return 'block';
      default: return 'help';
    }
  }

  getNivelExperienciaColor(nivel: NivelExperiencia): string {
    switch (nivel) {
      case NivelExperiencia.JUNIOR: return 'basic';
      case NivelExperiencia.INTERMEDIO: return 'primary';
      case NivelExperiencia.SENIOR: return 'accent';
      case NivelExperiencia.EXPERTO: return 'warn';
      default: return 'basic';
    }
  }

  getEstadoTicketColor(estado: string): string {
    switch (estado.toUpperCase()) {
      case 'PENDIENTE': return 'pendiente';
      case 'EN_PROGRESO': return 'en-progreso';
      case 'ASIGNADO': return 'asignado';
      case 'PENDIENTE': return 'pendiente';
      case 'RESUELTO': return 'resuelto';
      case 'CERRADO': return 'cerrado';
      case 'CANCELADO': return 'cancelado';
      default: return 'basic';
    }
  }

  getPrioridadColor(prioridad: string): string {
    switch (prioridad.toUpperCase()) {
      case 'BAJA': return 'baja';
      case 'MEDIA': return 'media';
      case 'ALTA': return 'alta';
      case 'CRITICA': return 'critica';
      default: return 'basic';
    }
  }

  formatearFecha(fecha: Date | string | null | undefined): string {
    if (!fecha) return 'No disponible';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getPorcentajeCarga(cargaActual: number, maxTickets: number): number {
    if (maxTickets === 0) return 0;
    return Math.round((cargaActual / maxTickets) * 100);
  }

  getColorBarraCarga(porcentaje: number): string {
    if (porcentaje <= 50) return 'primary';
    if (porcentaje <= 80) return 'accent';
    return 'warn';
  }

  getEspecialidadColorClass(nombreEspecialidad: string): string {
    const nombre = nombreEspecialidad.toLowerCase();
    if (nombre.includes('redes') || nombre.includes('network')) {
      return 'especialidad-redes';
    } else if (nombre.includes('hardware')) {
      return 'especialidad-hardware';
    } else if (nombre.includes('software')) {
      return 'especialidad-software';
    } else if (nombre.includes('seguridad') || nombre.includes('security')) {
      return 'especialidad-seguridad';
    } else if (nombre.includes('db') || nombre.includes('base de datos') || nombre.includes('database')) {
      return 'especialidad-database';
    } else if (nombre.includes('servidor') || nombre.includes('server')) {
      return 'especialidad-servidores';
    }
    return 'especialidad-default';
  }
}