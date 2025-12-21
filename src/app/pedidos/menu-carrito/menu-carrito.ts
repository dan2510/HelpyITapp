import { Component, OnInit, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MenuService } from '../../share/services/api/menu.service';
import { CategoriaService } from '../../share/services/api/categoria.service';
import { ConfiguracionService } from '../../share/services/api/configuracion.service';
import { NotificationService } from '../../share/services/app/notification.service';
import { MenuItemModel } from '../../share/models/MenuItemModel';
import { CategoriaMenuModel } from '../../share/models/CategoriaMenuModel';
import { ProductoDialogComponent, ProductoSeleccionado } from '../producto-dialog/producto-dialog';

interface CarritoItem {
  menuItem: MenuItemModel;
  cantidad: number;
  subtotal: number;
  variantesSeleccionadas?: any[];
  notas?: string;
}

@Component({
  selector: 'app-menu-carrito',
  standalone: false,
  templateUrl: './menu-carrito.html',
  styleUrl: './menu-carrito.css'
})
export class MenuCarritoComponent implements OnInit {
  categorias = signal<CategoriaMenuModel[]>([]);
  menuItems = signal<MenuItemModel[]>([]);
  carrito = signal<CarritoItem[]>([]);
  loading = signal<boolean>(false);
  error = signal<string>('');
  categoriaSeleccionada = signal<string | null>(null);
  mostrarCarrito = signal<boolean>(false);
  nombreCliente = signal<string>('');

  // Totales calculados
  subtotal = computed(() => {
    return this.carrito().reduce((sum, item) => sum + item.subtotal, 0);
  });

  servicioExpress = computed(() => {
    if (this.carrito().length === 0) {
      return 0;
    }

    const distancia = this.distanciaKm();
    const precioKm = this.precioPorKm();

    // Si no hay distancia calculada, usar precio fijo por defecto
    if (distancia === 0 || !precioKm) {
      return 800; // Valor por defecto
    }

    // Calcular: distancia (km) × precio por kilómetro
    const costo = distancia * precioKm;
    
    // Redondear a 2 decimales
    return Math.round(costo * 100) / 100;
  });

  total = computed(() => {
    return this.subtotal() + this.servicioExpress();
  });

  cantidadItems = computed(() => {
    return this.carrito().reduce((sum, item) => sum + item.cantidad, 0);
  });

  precioPorKm = signal<number>(800);
  distanciaKm = signal<number>(0);
  coordenadasRestaurante = signal<{ lat: number; lng: number } | null>(null);

  constructor(
    private menuService: MenuService,
    private categoriaService: CategoriaService,
    private configuracionService: ConfiguracionService,
    private router: Router,
    private notification: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // Verificar que hay un cliente en sessionStorage
    const clienteTemporal = sessionStorage.getItem('clienteTemporal');
    if (!clienteTemporal) {
      this.notification.error('Error', 'Debe iniciar sesión primero');
      this.router.navigate(['/pedidos/telefono']);
      return;
    }

    // Cargar nombre del cliente
    try {
      const cliente = JSON.parse(clienteTemporal);
      if (cliente.nombrecompleto) {
        this.nombreCliente.set(cliente.nombrecompleto);
      }
    } catch (error) {
      console.error('Error al parsear cliente:', error);
    }

    this.loadConfiguracion();
    this.loadCoordenadasRestaurante();
    this.calcularDistancia();
    this.loadMenu();
  }

  loadConfiguracion(): void {
    // Cargar precio por kilómetro del servicio express
    this.configuracionService.getPrecioPorKilometro().subscribe({
      next: (precio) => {
        this.precioPorKm.set(precio);
      },
      error: (err) => {
        console.error('Error al cargar configuración:', err);
        // Usar valor por defecto
        this.precioPorKm.set(800);
      }
    });
  }

  loadCoordenadasRestaurante(): void {
    // Cargar coordenadas del restaurante desde configuración
    // Por ahora, usar coordenadas por defecto (pueden configurarse después)
    this.configuracionService.getByClave('restaurante_latitud').subscribe({
      next: (response: any) => {
        if (response.success && response.data?.valorParsed) {
          const lat = Number(response.data.valorParsed);
          this.configuracionService.getByClave('restaurante_longitud').subscribe({
            next: (responseLng: any) => {
              if (responseLng.success && responseLng.data?.valorParsed) {
                const lng = Number(responseLng.data.valorParsed);
                this.coordenadasRestaurante.set({ lat, lng });
                this.calcularDistancia();
              }
            }
          });
        }
      },
      error: () => {
        // Coordenadas por defecto del restaurante (San José, Costa Rica)
        // Estas pueden configurarse desde el panel de administración
        this.coordenadasRestaurante.set({ lat: 9.9281, lng: -84.0907 });
        this.calcularDistancia();
      }
    });
  }

  calcularDistancia(): void {
    const clienteTemporal = sessionStorage.getItem('clienteTemporal');
    if (!clienteTemporal) {
      this.distanciaKm.set(0);
      return;
    }

    try {
      const cliente = JSON.parse(clienteTemporal);
      const clienteLat = cliente.latitud ? Number(cliente.latitud) : null;
      const clienteLng = cliente.longitud ? Number(cliente.longitud) : null;

      const restaurante = this.coordenadasRestaurante();

      if (!clienteLat || !clienteLng || !restaurante) {
        this.distanciaKm.set(0);
        return;
      }

      // Calcular distancia usando fórmula de Haversine
      const distancia = this.calcularDistanciaHaversine(
        restaurante.lat,
        restaurante.lng,
        clienteLat,
        clienteLng
      );

      this.distanciaKm.set(distancia);
    } catch (error) {
      console.error('Error al calcular distancia:', error);
      this.distanciaKm.set(0);
    }
  }

  // Fórmula de Haversine para calcular distancia entre dos puntos GPS
  calcularDistanciaHaversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en kilómetros
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distancia = R * c;
    return Math.round(distancia * 100) / 100; // Redondear a 2 decimales
  }

  toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Obtener saludo según la hora del día
  getSaludo(): string {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) {
      return 'Buenos días';
    } else if (hora >= 12 && hora < 18) {
      return 'Buenas tardes';
    } else {
      return 'Buenas noches';
    }
  }

  loadMenu(): void {
    this.loading.set(true);
    this.error.set('');

    // Cargar categorías y menú
    this.categoriaService.get().subscribe({
      next: (response: any) => {
        if (response.success && response.data?.categorias) {
          this.categorias.set(response.data.categorias);
          
          // Extraer todos los items del menú de las categorías
          const items: MenuItemModel[] = [];
          response.data.categorias.forEach((cat: CategoriaMenuModel) => {
            if (cat.itemsMenu && Array.isArray(cat.itemsMenu)) {
              items.push(...cat.itemsMenu);
            }
          });
          
          // Cargar variantes para cada item que las tenga
          this.cargarVariantesParaItems(items);
        }
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Error al cargar menú:', error);
        this.error.set('Error al cargar el menú');
        this.loading.set(false);
        this.notification.error('Error', 'No se pudo cargar el menú');
      }
    });
  }

  cargarVariantesParaItems(items: MenuItemModel[]): void {
    const itemsConVariantes: MenuItemModel[] = [];
    let itemsCargados = 0;

    items.forEach((item) => {
      if (item.tieneVariantes) {
        // Cargar el item completo con sus variantes
        this.menuService.getById(item.id).subscribe({
          next: (response: any) => {
            if (response.success && response.data?.item) {
              itemsConVariantes.push(response.data.item);
            } else if (response.data) {
              itemsConVariantes.push(response.data);
            } else {
              itemsConVariantes.push(item);
            }
            itemsCargados++;
            if (itemsCargados === items.filter(i => i.tieneVariantes).length) {
              // Agregar items sin variantes
              items.filter(i => !i.tieneVariantes).forEach(i => itemsConVariantes.push(i));
              this.menuItems.set(itemsConVariantes);
            }
          },
          error: () => {
            itemsConVariantes.push(item);
            itemsCargados++;
            if (itemsCargados === items.filter(i => i.tieneVariantes).length) {
              items.filter(i => !i.tieneVariantes).forEach(i => itemsConVariantes.push(i));
              this.menuItems.set(itemsConVariantes);
            }
          }
        });
      } else {
        itemsConVariantes.push(item);
        if (items.filter(i => !i.tieneVariantes).length === itemsConVariantes.length) {
          this.menuItems.set(itemsConVariantes);
        }
      }
    });
  }

  getItemsPorCategoria(categoriaId: number): MenuItemModel[] {
    return this.menuItems().filter(item => item.idcategoria === categoriaId && item.disponible && item.activo);
  }

  abrirDialogoProducto(item: MenuItemModel): void {
    // Cargar el item completo con variantes si no las tiene
    if (item.tieneVariantes && (!item.gruposVariantes || item.gruposVariantes.length === 0)) {
      this.menuService.getById(item.id).subscribe({
        next: (response: any) => {
          const itemCompleto = response.success && response.data?.item 
            ? response.data.item 
            : response.data || item;
          this.mostrarDialogo(itemCompleto);
        },
        error: () => {
          this.mostrarDialogo(item);
        }
      });
    } else {
      this.mostrarDialogo(item);
    }
  }

  mostrarDialogo(item: MenuItemModel): void {
    const dialogRef = this.dialog.open(ProductoDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      data: { producto: item },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe((result: ProductoSeleccionado) => {
      if (result) {
        this.agregarProductoAlCarrito(result);
      }
    });
  }

  agregarProductoAlCarrito(productoSeleccionado: ProductoSeleccionado): void {
    const carritoActual = this.carrito();
    
    // Crear un identificador único para el item con sus variantes
    const variantesId = this.generarIdVariantes(productoSeleccionado.variantesSeleccionadas);
    const itemExistente = carritoActual.find(c => 
      c.menuItem.id === productoSeleccionado.producto.id &&
      this.generarIdVariantes(c.variantesSeleccionadas || []) === variantesId
    );

    if (itemExistente) {
      // Aumentar cantidad
      itemExistente.cantidad += productoSeleccionado.cantidad;
      itemExistente.subtotal = productoSeleccionado.precioFinal * itemExistente.cantidad;
    } else {
      // Agregar nuevo item
      const nuevoItem: CarritoItem = {
        menuItem: productoSeleccionado.producto,
        cantidad: productoSeleccionado.cantidad,
        subtotal: productoSeleccionado.precioFinal,
        variantesSeleccionadas: productoSeleccionado.variantesSeleccionadas,
        notas: productoSeleccionado.notas
      };
      carritoActual.push(nuevoItem);
    }

    this.carrito.set([...carritoActual]);
    this.notification.success('Agregado', `${productoSeleccionado.producto.nombre} agregado al carrito`);
  }

  generarIdVariantes(variantes: any[]): string {
    if (!variantes || variantes.length === 0) return 'sin-variantes';
    return variantes.map(v => 
      `${v.grupoId}:${v.opcionesSeleccionadas.map((o: any) => o.opcionId).join(',')}`
    ).join('|');
  }

  // Método legacy para compatibilidad (productos sin variantes)
  agregarAlCarrito(item: MenuItemModel): void {
    if (item.tieneVariantes) {
      this.abrirDialogoProducto(item);
      return;
    }

    const carritoActual = this.carrito();
    const itemExistente = carritoActual.find(c => 
      c.menuItem.id === item.id && 
      (!c.variantesSeleccionadas || c.variantesSeleccionadas.length === 0)
    );

    if (itemExistente) {
      itemExistente.cantidad++;
      itemExistente.subtotal = Number(item.precio) * itemExistente.cantidad;
    } else {
      const nuevoItem: CarritoItem = {
        menuItem: item,
        cantidad: 1,
        subtotal: Number(item.precio)
      };
      carritoActual.push(nuevoItem);
    }

    this.carrito.set([...carritoActual]);
    this.notification.success('Agregado', `${item.nombre} agregado al carrito`);
  }

  aumentarCantidad(item: CarritoItem): void {
    item.cantidad++;
    // Recalcular subtotal basado en precio final
    const precioUnitario = item.subtotal / (item.cantidad - 1);
    item.subtotal = precioUnitario * item.cantidad;
    this.carrito.set([...this.carrito()]);
  }

  disminuirCantidad(item: CarritoItem): void {
    if (item.cantidad > 1) {
      item.cantidad--;
      const precioUnitario = item.subtotal / (item.cantidad + 1);
      item.subtotal = precioUnitario * item.cantidad;
      this.carrito.set([...this.carrito()]);
    }
  }

  eliminarDelCarrito(item: CarritoItem): void {
    const carritoActual = this.carrito();
    const index = carritoActual.indexOf(item);
    if (index > -1) {
      carritoActual.splice(index, 1);
      this.carrito.set([...carritoActual]);
      this.notification.success('Eliminado', `${item.menuItem.nombre} eliminado del carrito`);
    }
  }

  toggleCarrito(): void {
    this.mostrarCarrito.set(!this.mostrarCarrito());
  }

  continuarComprando(): void {
    this.mostrarCarrito.set(false);
  }

  finalizarPedido(): void {
    if (this.carrito().length === 0) {
      this.notification.error('Error', 'El carrito está vacío');
      return;
    }

    // Guardar carrito en sessionStorage y navegar a pago
    sessionStorage.setItem('carritoTemporal', JSON.stringify(this.carrito()));
    sessionStorage.setItem('totalesTemporal', JSON.stringify({
      subtotal: this.subtotal(),
      servicioExpress: this.servicioExpress(),
      total: this.total()
    }));

    this.router.navigate(['/pedidos/pago']);
  }

  formatearPrecio(precio: number): string {
    return `₡${precio.toLocaleString('es-CR')}`;
  }

  formatearVariantes(opciones: any[]): string {
    if (!opciones || opciones.length === 0) return '';
    return opciones.map(o => o.nombre + (o.subOpcion ? ' (' + o.subOpcion + ')' : '')).join(', ');
  }

  // Exponer Number para el template
  Number = Number;
}

