// src/app/categorias/categoria-index/categoria-index.ts
import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CategoriaService } from '../../share/services/api/categoria.service';
import { CategoriaModel } from '../../share/models/CategoriaModel';
import { NotificationService } from '../../share/services/app/notification.service';

@Component({
  selector: 'app-categoria-index',
  standalone: false,
  templateUrl: './categoria-index.html',
  styleUrl: './categoria-index.css',
})
export class CategoriaIndex implements OnInit {
  protected readonly categorias = signal<CategoriaModel[]>([]);
  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string>('');

  constructor(
    private categoriaService: CategoriaService,
    private router: Router,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCategorias();
  }

  loadCategorias(): void {
    this.loading.set(true);
    this.error.set('');

    this.categoriaService.get().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.categorias.set(response.data.categorias);
          console.log('Categorías cargadas:', response.data.categorias);
        } else {
          this.error.set('Error en la respuesta del servidor');
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.error.set('Error al conectar con el servidor');
        this.loading.set(false);
        this.notification.error('Error', 'No se pudieron cargar las categorías');
      }
    });
  }

  verDetalle(id: number): void {
    this.router.navigate(['/categorias', id]);
  }

  getEstadoColor(activo: boolean): string {
    return activo ? 'primary' : 'warn';
  }

  getEstadoText(activo: boolean): string {
    return activo ? 'Activa' : 'Inactiva';
  }

  getTiempoRespuestaColor(minutos: number): string {
    if (minutos <= 30) return 'success';
    if (minutos <= 120) return 'primary';
    if (minutos <= 480) return 'warn';
    return 'accent';
  }

  formatearTiempoRespuesta(minutos: number): string {
    if (minutos < 60) {
      return `${minutos} min`;
    }
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return mins > 0 ? `${horas}h ${mins}m` : `${horas}h`;
  }

  retry(): void {
    this.loadCategorias();
  }
}