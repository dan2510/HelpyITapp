import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrdenService } from '../../share/services/api/orden.service';
import { NotificationService } from '../../share/services/app/notification.service';
import { EstadoOrden } from '../../share/models/EnumsModel';

interface EstadoInfo {
  estado: EstadoOrden;
  nombre: string;
  icono: string;
  color: string;
  descripcion: string;
}

@Component({
  selector: 'app-seguimiento-pedido',
  standalone: false,
  templateUrl: './seguimiento-pedido.html',
  styleUrl: './seguimiento-pedido.css'
})
export class SeguimientoPedidoComponent implements OnInit {
  orden = signal<any>(null);
  loading = signal<boolean>(true);
  error = signal<string>('');
  numeroPedido = signal<string>('');

  estados: EstadoInfo[] = [
    { estado: EstadoOrden.RECIBIDO, nombre: 'Recibido', icono: 'inbox', color: 'primary', descripcion: 'Estamos preparando tu pedido' },
    { estado: EstadoOrden.EN_PREPARACION, nombre: 'En Preparación', icono: 'restaurant', color: 'accent', descripcion: 'Tu pedido está en la cocina' },
    { estado: EstadoOrden.LISTO, nombre: 'Listo para Entrega', icono: 'check_circle', color: 'primary', descripcion: 'Empacando tu pedido' },
    { estado: EstadoOrden.EN_CAMINO, nombre: 'En Camino', icono: 'local_shipping', color: 'accent', descripcion: 'El repartidor va hacia ti' },
    { estado: EstadoOrden.ENTREGADO, nombre: 'Entregado', icono: 'done_all', color: 'primary', descripcion: '¡Disfruta tu comida!' }
  ];

  estadoActual = computed(() => {
    const orden = this.orden();
    if (!orden) return null;
    return this.estados.find(e => e.estado === orden.estado);
  });

  progreso = computed(() => {
    const orden = this.orden();
    if (!orden) return 0;
    const estadoIndex = this.estados.findIndex(e => e.estado === orden.estado);
    return ((estadoIndex + 1) / this.estados.length) * 100;
  });

  constructor(
    private route: ActivatedRoute,
    public router: Router, // Cambiar a public para usar en template
    private ordenService: OrdenService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const numeroPedido = params['numeroPedido'];
      if (numeroPedido) {
        this.numeroPedido.set(numeroPedido);
        this.cargarOrden(numeroPedido);
        
        // Actualizar cada 10 segundos
        setInterval(() => {
          this.cargarOrden(numeroPedido);
        }, 10000);
      }
    });
  }

  cargarOrden(numeroPedido: string): void {
    this.loading.set(true);
    this.error.set('');

    // Buscar orden por número de pedido (endpoint público)
    this.ordenService.buscarPorNumero(numeroPedido).subscribe({
      next: (response: any) => {
        this.loading.set(false);
        
        if (response.success && response.data?.orden) {
          this.orden.set(response.data.orden);
        } else {
          this.error.set('Pedido no encontrado');
        }
      },
      error: (error: any) => {
        this.loading.set(false);
        // Intentar cargar desde sessionStorage como fallback
        const ordenStr = sessionStorage.getItem('ordenConfirmada');
        if (ordenStr) {
          const orden = JSON.parse(ordenStr);
          if (orden.numeropedido === numeroPedido) {
            this.orden.set(orden);
            return;
          }
        }
        this.error.set('Error al cargar el pedido. Verifique el número de orden.');
        console.error('Error al cargar orden:', error);
      }
    });
  }

  contactarRestaurante(): void {
    const telefono = '88888888'; // Número del restaurante
    const urlWhatsApp = `https://wa.me/506${telefono}?text=Hola, tengo una consulta sobre mi pedido ${this.numeroPedido()}`;
    window.open(urlWhatsApp, '_blank');
  }

  formatearPrecio(precio: number): string {
    return `₡${precio.toLocaleString('es-CR')}`;
  }

  formatearFecha(fecha: string | Date): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleString('es-CR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  esEstadoCompletado(estado: EstadoOrden): boolean {
    const orden = this.orden();
    if (!orden) return false;
    const estadoIndex = this.estados.findIndex(e => e.estado === orden.estado);
    const compararIndex = this.estados.findIndex(e => e.estado === estado);
    return compararIndex < estadoIndex;
  }

  // Exponer Math y Number para el template
  Math = Math;
  Number = Number;
}

