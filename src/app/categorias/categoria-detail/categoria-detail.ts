import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriaService } from '../../share/services/api/categoria.service';
import { CategoriaDetalle, CategoriaDetailResponse } from '../../share/models/CategoriaDetailModel';
import { NotificationService } from '../../share/services/app/notification.service';

@Component({
  selector: 'app-categoria-detail',
  standalone: false,
  templateUrl: './categoria-detail.html',
  styleUrl: './categoria-detail.css',
})
export class CategoriaDetail implements OnInit {
  protected readonly categoria = signal<CategoriaDetalle | null>(null);
  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly categoriaId = signal<number>(0);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categoriaService: CategoriaService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = parseInt(params['id']);
      if (id && !isNaN(id)) {
        this.categoriaId.set(id);
        this.loadCategoriaDetail(id);
      } else {
        this.error.set('ID de categoría inválido');
        this.notification.error('Error', 'ID de categoría inválido');
      }
    });
  }

  /**
   * Usa el método getById() heredado de BaseAPI
   * Tu backend debe retornar: CategoriaDetailResponse
   */
  loadCategoriaDetail(id: number): void {
    this.loading.set(true);
    this.error.set('');

    // Usa el método getById() heredado de BaseAPI
    this.categoriaService.getById(id).subscribe({
      next: (response: any) => {
        // Backend retorna { success: boolean, data: { categoria: {...} } }
        if (response.success) {
          this.categoria.set(response.data.categoria);
          console.log('Detalle de la categoría cargado:', response.data.categoria);
        } else {
          this.error.set('Error en la respuesta del servidor');
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar detalle de la categoría:', error);
        this.error.set('No se pudo cargar la información de la categoría');
        this.loading.set(false);
        this.notification.error('Error', 'No se pudo cargar la información de la categoría');
      }
    });
  }

  regresarAlListado(): void {
    this.router.navigate(['/categorias']);
  }

  retry(): void {
    if (this.categoriaId() > 0) {
      this.loadCategoriaDetail(this.categoriaId());
    }
  }

  // Métodos auxiliares para el template
  getEstadoColor(activo: boolean): string {
    return activo ? 'primary' : 'warn';
  }

  getEstadoText(activo: boolean): string {
    return activo ? 'Activa' : 'Inactiva';
  }

  getSlaColorClass(porcentaje: number): string {
    if (porcentaje <= 25) return 'sla-critico';
    if (porcentaje <= 50) return 'sla-alto';
    if (porcentaje <= 75) return 'sla-medio';
    return 'sla-bajo';
  }

  formatearFecha(fecha: Date | string | null | undefined): string {
    if (!fecha) return 'No disponible';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  }

  calcularPorcentajeSLA(minutos: number, maximo: number): number {
    if (maximo === 0) return 0;
    return Math.round((minutos / maximo) * 100);
  }

  getColorBarraSLA(tiempoMinutos: number): string {
    if (tiempoMinutos <= 60) return 'accent'; // Muy rápido - rojo/crítico
    if (tiempoMinutos <= 240) return 'warn'; // Rápido - amarillo
    if (tiempoMinutos <= 480) return 'primary'; // Normal - azul
    return 'basic'; // Lento - gris
  }

  formatearHoras(minutos: number): string {
    if (minutos < 60) {
      return `${minutos} minutos`;
    }
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    if (mins === 0) {
      return `${horas} ${horas === 1 ? 'hora' : 'horas'}`;
    }
    return `${horas}h ${mins}m`;
  }

  getEstadisticaColor(tipo: string): string {
    switch (tipo) {
      case 'total': return 'primary';
      case 'abiertos': return 'warn';
      case 'resueltos': return 'success';
      case 'criticos': return 'error';
      default: return 'neutral';
    }
  }
}