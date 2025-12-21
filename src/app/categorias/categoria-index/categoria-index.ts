// src/app/categorias/categoria-index/categoria-index.ts
import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
    private route: ActivatedRoute,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCategorias();
  }

  loadCategorias(): void {
    this.loading.set(true);
    this.error.set('');

    console.log('📋 [FRONTEND] Cargando categorías...');

    this.categoriaService.get().subscribe({
      next: (response: any) => {
        console.log('📋 [FRONTEND] Respuesta completa recibida:', JSON.stringify(response, null, 2));
        if (response && response.success) {
          const categoriasData = response.data?.categorias || response.data || [];
          console.log('📋 [FRONTEND] Datos de categorías extraídos:', categoriasData);
          console.log('📋 [FRONTEND] Cantidad de categorías:', categoriasData.length);
          this.categorias.set(Array.isArray(categoriasData) ? categoriasData : []);
          console.log('✅ [FRONTEND] Categorías asignadas al signal:', this.categorias().length);
        } else {
          console.error('❌ [FRONTEND] Respuesta sin success:', response);
          this.error.set('Error en la respuesta del servidor');
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('❌ [FRONTEND] Error al cargar categorías:', error);
        console.error('❌ [FRONTEND] Error status:', error.status);
        console.error('❌ [FRONTEND] Error message:', error.message);
        console.error('❌ [FRONTEND] Error URL:', error.url);
        this.error.set(`Error ${error.status || 'desconocido'}: ${error.message || 'Error al conectar con el servidor'}`);
        this.loading.set(false);
        this.notification.error(
          'Error', 
          `Error al cargar las categorías: ${error.status || 'desconocido'}`
        );
      }
    });
  }

  verDetalle(id: number): void {
    // Usar ruta relativa para que funcione desde /categorias-menu o /menu
    this.router.navigate([id], { relativeTo: this.route });
  }

  crearNuevaCategoria(): void {
    // Usar ruta relativa para que funcione desde /categorias-menu o /menu
    this.router.navigate(['nuevo'], { relativeTo: this.route });
  }

  getEstadoColor(activo: boolean): string {
    return activo ? 'primary' : 'warn';
  }

  getEstadoText(activo: boolean): string {
    return activo ? 'Activo' : 'Inactivo';
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