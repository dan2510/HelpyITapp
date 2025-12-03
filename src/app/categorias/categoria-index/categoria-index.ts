// src/app/categorias/categoria-index/categoria-index.ts
import { Component, OnInit, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CategoriaService } from '../../share/services/api/categoria.service';
import { CategoriaModel } from '../../share/models/CategoriaModel';
import { NotificationService } from '../../share/services/app/notification.service';
import { TranslationService } from '../../share/services/app/translation.service';

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
  private translationService = inject(TranslationService);

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
          this.error.set(this.translationService.translate('CATEGORIES.ERROR_SERVER_RESPONSE'));
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
        this.error.set(this.translationService.translate('CATEGORIES.ERROR_CONNECTION'));
        this.loading.set(false);
        this.notification.error(
          this.translationService.translate('COMMON.ERROR'), 
          this.translationService.translate('CATEGORIES.ERROR_LOADING_CATEGORIES')
        );
      }
    });
  }

  verDetalle(id: number): void {
    this.router.navigate(['/categorias', id]);
  }

  crearNuevaCategoria(): void {
    this.router.navigate(['/categorias/nuevo']);
  }

  getEstadoColor(activo: boolean): string {
    return activo ? 'primary' : 'warn';
  }

  getEstadoText(activo: boolean): string {
    return activo ? this.translationService.translate('CATEGORIES.ACTIVE') : this.translationService.translate('CATEGORIES.INACTIVE');
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