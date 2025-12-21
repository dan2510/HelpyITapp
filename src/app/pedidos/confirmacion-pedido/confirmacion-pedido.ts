
import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationService } from '../../share/services/app/notification.service';

@Component({
  selector: 'app-confirmacion-pedido',
  standalone: false,
  templateUrl: './confirmacion-pedido.html',
  styleUrl: './confirmacion-pedido.css'
})
export class ConfirmacionPedidoComponent implements OnInit {
  orden = signal<any>(null);
  cliente = signal<any>(null);
  loading = signal<boolean>(true);

  constructor(
    private router: Router,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    const ordenStr = sessionStorage.getItem('ordenConfirmada');
    const clienteStr = sessionStorage.getItem('clienteTemporal');

    if (!ordenStr) {
      this.notification.error('Error', 'No hay información del pedido');
      this.router.navigate(['/pedidos/telefono']);
      return;
    }

    this.orden.set(JSON.parse(ordenStr));
    if (clienteStr) {
      this.cliente.set(JSON.parse(clienteStr));
    }
    this.loading.set(false);
  }

  verSeguimiento(): void {
    const orden = this.orden();
    if (orden?.numeropedido) {
      this.router.navigate(['/pedidos/seguimiento', orden.numeropedido]);
    }
  }

  volverAlInicio(): void {
    // Limpiar sessionStorage
    sessionStorage.removeItem('clienteTemporal');
    sessionStorage.removeItem('ordenConfirmada');
    this.router.navigate(['/inicio']);
  }

  formatearPrecio(precio: number): string {
    return `₡${precio.toLocaleString('es-CR')}`;
  }

  formatearMetodoPago(metodo: string): string {
    const metodos: { [key: string]: string } = {
      'EFECTIVO': 'Efectivo',
      'TARJETA': 'Tarjeta',
      'SINPE_MOVIL': 'SINPE Móvil'
    };
    return metodos[metodo] || metodo;
  }

  // Exponer Number para el template
  Number = Number;
}

