// src/app/categorias/categoria-detail/categoria-detail.ts
import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriaService } from '../../share/services/api/categoria.service';
import { CategoriaModel } from '../../share/models/CategoriaModel';
import { NotificationService } from '../../share/services/app/notification.service';
@Component({
  selector: 'app-categoria-detail',
  standalone: false,
  templateUrl: './categoria-detail.html',
  styleUrl: './categoria-detail.css',
})
export class CategoriaDetail implements OnInit {
  protected readonly categoria = signal<CategoriaModel | null>(null);
  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly categoriaId = signal<number>(0);
  
  // Exponer Number para el template
  Number = Number;

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
        this.notification.error(
          'Error', 
          'ID de categoría inválido'
        );
      }
    });
  }

  loadCategoriaDetail(id: number): void {
    this.loading.set(true);
    this.error.set('');

    this.categoriaService.getById(id).subscribe({
      next: (response: any) => {
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
        this.error.set('Error al cargar la categoría');
        this.loading.set(false);
        this.notification.error(
          'Error', 
          'Error al cargar la categoría'
        );
      }
    });
  }

  regresarAlListado(): void {
    // Navegar a la ruta padre (listado)
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  editarCategoria(): void {
    if (this.categoriaId() > 0) {
      // Navegar a la ruta de edición relativa
      this.router.navigate(['../editar', this.categoriaId()], { relativeTo: this.route });
    }
  }

  retry(): void {
    if (this.categoriaId() > 0) {
      this.loadCategoriaDetail(this.categoriaId());
    }
  }

  getEstadoColor(activo: boolean): string {
    return activo ? 'primary' : 'warn';
  }

  getEstadoText(activo: boolean): string {
    return activo ? 'Activo' : 'Inactivo';
  }

  getEspecialidadEstadoText(activo: boolean): string {
    return activo ? 'Activo' : 'Inactivo';
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
    if (tiempoMinutos <= 60) return 'accent';
    if (tiempoMinutos <= 240) return 'warn';
    if (tiempoMinutos <= 480) return 'primary';
    return 'basic';
  }

  formatearHoras(minutos: number): string {
    if (minutos < 60) {
      return `${minutos} minutos`;
    }
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    if (mins === 0) {
      const hourText = horas === 1 ? 'hora' : 'horas';
      return `${horas} ${hourText}`;
    }
    return `${horas}h ${mins}m`;
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