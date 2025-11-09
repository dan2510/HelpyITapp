import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TiqueteService } from '../../share/services/api/tiquete.service';
import { TiqueteDetalle } from '../../share/models/TiqueteDetailModel';
import { NotificationService } from '../../share/services/app/notification.service';
import { Prioridad, EstadoTiquete } from '../../share/models/EnumsModel';

@Component({
  selector: 'app-tiquete-detail',
  standalone: false,
  templateUrl: './tiquete-detail.html',
  styleUrl: './tiquete-detail.css',
})
export class TiqueteDetail implements OnInit {
  protected readonly tiquete = signal<TiqueteDetalle | null>(null);
  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly tiqueteId = signal<number>(0);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tiqueteService: TiqueteService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = parseInt(params['id']);
      if (id && !isNaN(id)) {
        this.tiqueteId.set(id);
        this.loadTiqueteDetail(id);
      } else {
        this.error.set('ID de tiquete inválido');
        this.notification.error('Error', 'ID de tiquete inválido');
      }
    });
  }

  loadTiqueteDetail(id: number): void {
    this.loading.set(true);
    this.error.set('');

    this.tiqueteService.getById(id).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.tiquete.set(response.data.tiquete);
          console.log('Detalle del tiquete cargado:', response.data.tiquete);
        } else {
          this.error.set('Error en la respuesta del servidor');
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar detalle del tiquete:', error);
        this.error.set('No se pudo cargar la información del tiquete');
        this.loading.set(false);
        this.notification.error('Error', 'No se pudo cargar la información del tiquete');
      }
    });
  }

  regresarAlListado(): void {
    this.router.navigate(['/tiquetes']);
  }

  retry(): void {
    if (this.tiqueteId() > 0) {
      this.loadTiqueteDetail(this.tiqueteId());
    }
  }

  // Métodos auxiliares
  getPrioridadColor(prioridad: Prioridad): string {
    switch (prioridad) {
      case Prioridad.BAJA: return 'primary';
      case Prioridad.MEDIA: return 'accent';
      case Prioridad.ALTA: return 'warn';
      case Prioridad.CRITICA: return 'error';
      default: return 'basic';
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

  formatearFechaCorta(fecha: Date | string | null | undefined): string {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getCumplimientoIcon(cumplido: boolean | null): string {
    if (cumplido === null) return 'help';
    return cumplido ? 'check_circle' : 'cancel';
  }

  getCumplimientoColor(cumplido: boolean | null): string {
    if (cumplido === null) return 'neutral';
    return cumplido ? 'success' : 'error';
  }

  getCumplimientoTexto(cumplido: boolean | null): string {
    if (cumplido === null) return 'Pendiente';
    return cumplido ? 'Cumplido' : 'No Cumplido';
  }

  getEstrellas(calificacion: number): string[] {
    const estrellas = [];
    for (let i = 1; i <= 5; i++) {
      estrellas.push(i <= calificacion ? 'star' : 'star_border');
    }
    return estrellas;
  }

  getColorCalificacion(calificacion: number): string {
    if (calificacion >= 4) return 'success';
    if (calificacion >= 3) return 'primary';
    if (calificacion >= 2) return 'warn';
    return 'error';
  }
}