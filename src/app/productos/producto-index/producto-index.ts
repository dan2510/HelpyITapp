import { Component, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ProductoService } from '../../share/services/api/producto.service';
import { CategoriaService } from '../../share/services/api/categoria.service';
import { NotificationService } from '../../share/services/app/notification.service';
import { MenuItemModel } from '../../share/models/MenuItemModel';
import { CategoriaModel } from '../../share/models/CategoriaModel';
import { ProductoDetailDialogComponent } from '../producto-detail-dialog/producto-detail-dialog';

@Component({
  selector: 'app-producto-index',
  standalone: false,
  templateUrl: './producto-index.html',
  styleUrl: './producto-index.css',
})
export class ProductoIndex implements OnInit {
  productos = signal<MenuItemModel[]>([]);
  categorias = signal<CategoriaModel[]>([]);
  loading = signal<boolean>(true);
  error = signal<string>('');
  categoriaFiltro = signal<number | null>(null);
  busqueda = signal<string>('');

  productosFiltrados = computed(() => {
    let filtrados = this.productos();

    // Filtrar por categoría
    if (this.categoriaFiltro() !== null) {
      filtrados = filtrados.filter(p => p.idcategoria === this.categoriaFiltro());
    }

    // Filtrar por búsqueda
    if (this.busqueda().trim()) {
      const termino = this.busqueda().toLowerCase();
      filtrados = filtrados.filter(p => 
        p.nombre.toLowerCase().includes(termino) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(termino))
      );
    }

    return filtrados;
  });

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCategorias();
    this.loadProductos();
  }

  loadCategorias(): void {
    this.categoriaService.get().subscribe({
      next: (response: any) => {
        if (response.success && response.data?.categorias) {
          this.categorias.set(response.data.categorias);
        }
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
      }
    });
  }

  loadProductos(): void {
    this.loading.set(true);
    this.error.set('');

    this.productoService.get().subscribe({
      next: (response: any) => {
        this.loading.set(false);
        if (response.success && response.data?.items) {
          this.productos.set(response.data.items);
        } else if (Array.isArray(response)) {
          // Si la respuesta es un array directo
          this.productos.set(response);
        } else {
          this.error.set('Error al cargar productos');
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Error al cargar productos');
        this.notification.error('Error', 'No se pudieron cargar los productos');
      }
    });
  }

  crearNuevoProducto(): void {
    this.router.navigate(['/productos/nuevo']);
  }

  editarProducto(id: number): void {
    this.router.navigate(['/productos/editar', id]);
  }

  eliminarProducto(producto: MenuItemModel): void {
    // Implementar confirmación y eliminación
    this.notification.warning('Funcionalidad pendiente', 'La eliminación de productos estará disponible pronto');
  }

  formatearPrecio(precio: number): string {
    return `₡${precio.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  getNombreCategoria(idcategoria: number): string {
    const categoria = this.categorias().find(c => c.id === idcategoria);
    return categoria?.nombre || 'Sin categoría';
  }

  verDetalleProducto(producto: MenuItemModel): void {
    // Cargar el producto completo con todas sus relaciones
    this.productoService.getById(producto.id).subscribe({
      next: (response: any) => {
        let productoCompleto: MenuItemModel;
        // El backend devuelve: { success: true, data: { item: {...} } }
        if (response.success && response.data?.item) {
          productoCompleto = response.data.item;
        } else if (response.data?.item) {
          productoCompleto = response.data.item;
        } else if (response.data) {
          productoCompleto = response.data;
        } else {
          productoCompleto = response;
        }
        
        // Debug: verificar que las variantes estén presentes
        console.log('Producto completo cargado:', productoCompleto);
        console.log('Grupos de variantes:', productoCompleto.gruposVariantes);
        
        this.dialog.open(ProductoDetailDialogComponent, {
          width: '90%',
          maxWidth: '1000px',
          data: { producto: productoCompleto },
          disableClose: false
        });
      },
      error: (err) => {
        console.error('Error al cargar detalle del producto:', err);
        // Si falla, abrir con el producto que ya tenemos
        this.dialog.open(ProductoDetailDialogComponent, {
          width: '90%',
          maxWidth: '1000px',
          data: { producto: producto },
          disableClose: false
        });
      }
    });
  }

  // Exponer Number para el template
  Number = Number;
}

