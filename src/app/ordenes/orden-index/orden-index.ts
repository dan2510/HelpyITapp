// src/app/ordenes/orden-index/orden-index.ts
import { Component, OnInit, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { OrdenService } from '../../share/services/api/orden.service';
import { OrdenModel } from '../../share/models/OrdenModel';
import { NotificationService } from '../../share/services/app/notification.service';
import { AuthenticationService } from '../../share/services/app/authentication.service';
import { RoleNombre, EstadoOrden, TipoPedido } from '../../share/models/EnumsModel';

@Component({
  selector: 'app-orden-index',
  standalone: false,
  templateUrl: './orden-index.html',
  styleUrl: './orden-index.css',
})
export class OrdenIndex implements OnInit {
  protected readonly ordenes = signal<OrdenModel[]>([]);
  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly rolActual = signal<string>('');

  constructor(
    private ordenService: OrdenService,
    private router: Router,
    private notification: NotificationService,
    private authService: AuthenticationService
  ) {}

  ngOnInit(): void {
    // Verificar autenticación
    if (!this.authService.authenticated()) {
      this.router.navigate(['/usuario/login']);
      return;
    }
    
    // Obtener rol del usuario autenticado
    const usuario = this.authService.usuario();
    if (usuario && usuario.rol) {
      this.rolActual.set(usuario.rol.nombre);
    }
    
    this.loadOrdenes();
  }

  loadOrdenes(): void {
    this.loading.set(true);
    this.error.set('');

    // Obtener órdenes del usuario autenticado
    this.ordenService.getMisOrdenes().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.ordenes.set(response.data.ordenes || []);
          this.rolActual.set(response.data.rol || '');
          console.log(`Órdenes cargadas para ${response.data.rol}:`, response.data.ordenes);
        } else {
          this.error.set('Error en la respuesta del servidor');
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar órdenes:', error);
        this.error.set('Error al conectar con el servidor');
        this.loading.set(false);
        if (error.status === 401) {
          this.notification.error('Error', 'Debe iniciar sesión');
          this.router.navigate(['/usuario/login']);
        } else {
          this.notification.error('Error', 'No se pudieron cargar las órdenes');
        }
      }
    });
  }

  verDetalle(id: number): void {
    this.router.navigate(['/ordenes', id]);
  }

  crearNuevaOrden(): void {
    this.router.navigate(['/ordenes/nuevo']);
  }

  // Métodos auxiliares para estados de orden
  getEstadoColor(estado: EstadoOrden | string | undefined): string {
    if (!estado) return 'basic';
    switch (estado) {
      case EstadoOrden.PENDIENTE: return 'pendiente';
      case EstadoOrden.EN_PREPARACION: return 'en-preparacion';
      case EstadoOrden.LISTO: return 'listo';
      case EstadoOrden.ENTREGADO: return 'entregado';
      case EstadoOrden.CANCELADO: return 'cancelado';
      default: return 'basic';
    }
  }

  getEstadoIcon(estado: EstadoOrden | string | undefined): string {
    if (!estado) return 'help';
    switch (estado) {
      case EstadoOrden.PENDIENTE: return 'schedule';
      case EstadoOrden.EN_PREPARACION: return 'restaurant';
      case EstadoOrden.LISTO: return 'check_circle';
      case EstadoOrden.ENTREGADO: return 'done_all';
      case EstadoOrden.CANCELADO: return 'cancel';
      default: return 'help';
    }
  }

  getTipoPedidoIcon(tipo: TipoPedido | string | undefined): string {
    if (!tipo) return 'help';
    switch (tipo) {
      case TipoPedido.COMER_AQUI: return 'restaurant';
      case TipoPedido.PARA_LLEVAR: return 'shopping_bag';
      case TipoPedido.DELIVERY: return 'delivery_dining';
      default: return 'help';
    }
  }

  formatearFecha(fecha: Date | string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatearFechaHora(fecha: Date | string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  retry(): void {
    this.loadOrdenes();
  }

  getTituloSegunRol(): string {
    const rol = this.rolActual();
    const titulos: { [key: string]: string } = {
      'ADMIN': 'Todas las Órdenes',
      'CLIENTE': 'Mis Órdenes',
      'DEFAULT': 'Órdenes'
    };
    return titulos[rol] || titulos['DEFAULT'];
  }

  getSubtituloSegunRol(): string {
    const rol = this.rolActual();
    const subtitulos: { [key: string]: string } = {
      'ADMIN': 'Gestiona todas las órdenes del restaurante',
      'CLIENTE': 'Historial de tus pedidos',
      'DEFAULT': 'Listado de órdenes'
    };
    return subtitulos[rol] || subtitulos['DEFAULT'];
  }

  getEstadoNombre(estado: EstadoOrden | string | undefined): string {
    if (!estado) return '';
    const estados: { [key: string]: string } = {
      'PENDIENTE': 'Pendiente',
      'EN_PREPARACION': 'En Preparación',
      'LISTO': 'Listo',
      'ENTREGADO': 'Entregado',
      'CANCELADO': 'Cancelado'
    };
    return estados[estado] || estado;
  }

  getTipoPedidoNombre(tipo: TipoPedido | string | undefined): string {
    if (!tipo) return '';
    const tipos: { [key: string]: string } = {
      'COMER_AQUI': 'Comer Aquí',
      'PARA_LLEVAR': 'Para Llevar',
      'DELIVERY': 'Delivery'
    };
    return tipos[tipo] || tipo;
  }
}

