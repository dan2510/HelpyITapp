import { Component, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OrdenService } from '../../share/services/api/orden.service';
import { NotificationService } from '../../share/services/app/notification.service';
import { MetodoPago } from '../../share/models/EnumsModel';

interface CarritoItem {
  menuItem: any;
  cantidad: number;
  subtotal: number;
  notas?: string;
}

interface Totales {
  subtotal: number;
  servicioExpress: number;
  total: number;
}

@Component({
  selector: 'app-pago',
  standalone: false,
  templateUrl: './pago.html',
  styleUrl: './pago.css'
})
export class PagoComponent implements OnInit {
  metodoPagoSeleccionado = signal<MetodoPago | null>(null);
  carrito = signal<CarritoItem[]>([]);
  totales = signal<Totales>({ subtotal: 0, servicioExpress: 0, total: 0 });
  loading = signal<boolean>(false);
  error = signal<string>('');

  // Formularios
  efectivoForm!: FormGroup;
  tarjetaForm!: FormGroup;
  sinpeForm!: FormGroup;

  // Estados de pago
  procesandoPago = signal<boolean>(false);
  numeroAutorizacion = signal<string>('');

  // Totales calculados
  cambio = computed(() => {
    if (this.metodoPagoSeleccionado() === MetodoPago.EFECTIVO && this.efectivoForm) {
      const montoRecibido = this.efectivoForm.get('montoRecibido')?.value || 0;
      return Math.max(0, montoRecibido - this.totales().total);
    }
    return 0;
  });

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private ordenService: OrdenService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    // Cargar carrito y totales de sessionStorage
    const carritoStr = sessionStorage.getItem('carritoTemporal');
    const totalesStr = sessionStorage.getItem('totalesTemporal');
    const clienteStr = sessionStorage.getItem('clienteTemporal');

    if (!carritoStr || !totalesStr || !clienteStr) {
      this.notification.error('Error', 'No hay información del pedido');
      this.router.navigate(['/pedidos/menu']);
      return;
    }

    this.carrito.set(JSON.parse(carritoStr));
    this.totales.set(JSON.parse(totalesStr));

    // Inicializar formularios
    this.efectivoForm = this.fb.group({
      montoRecibido: [this.totales().total, [Validators.required, Validators.min(this.totales().total)]]
    });

    this.tarjetaForm = this.fb.group({
      numeroTarjeta: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      nombreTarjeta: ['', [Validators.required, Validators.minLength(3)]],
      fechaVencimiento: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      tipoTarjeta: ['credito', Validators.required]
    });

    this.sinpeForm = this.fb.group({
      confirmado: [false, Validators.requiredTrue]
    });
  }

  seleccionarMetodoPago(metodo: string): void {
    this.metodoPagoSeleccionado.set(metodo as MetodoPago);
    this.error.set('');
  }

  volver(): void {
    this.router.navigate(['/pedidos/menu']);
  }

  procesarPagoEfectivo(): void {
    if (this.efectivoForm.invalid) {
      this.error.set('Por favor ingrese un monto válido');
      return;
    }

    if (this.cambio() < 0) {
      this.error.set('El monto recibido debe ser mayor o igual al total');
      return;
    }

    this.confirmarPedido('EFECTIVO' as MetodoPago, {
      montopagado: this.efectivoForm.get('montoRecibido')?.value,
      cambio: this.cambio()
    });
  }

  procesarPagoTarjeta(): void {
    if (this.tarjetaForm.invalid) {
      this.error.set('Por favor complete todos los campos de la tarjeta');
      return;
    }

    this.procesandoPago.set(true);
    this.error.set('');

    // Simular procesamiento de pago
    setTimeout(() => {
      const numeroTarjeta = this.tarjetaForm.get('numeroTarjeta')?.value;
      const numeroAutorizacion = Math.floor(100000 + Math.random() * 900000).toString();
      
      this.numeroAutorizacion.set(numeroAutorizacion);

      // Validar formato de tarjeta (simulación)
      if (numeroTarjeta.length !== 16) {
        this.procesandoPago.set(false);
        this.error.set('Número de tarjeta inválido');
        return;
      }

      this.procesandoPago.set(false);
      this.notification.success('¡Pago aprobado!', `Autorización: ${numeroAutorizacion}`);

      this.confirmarPedido('TARJETA' as MetodoPago, {
        numeroautorizacion: numeroAutorizacion,
        ultimos4digitos: numeroTarjeta.slice(-4)
      });
    }, 3000);
  }

  procesarPagoSinpe(): void {
    if (this.sinpeForm.get('confirmado')?.value !== true) {
      this.error.set('Debe confirmar que realizó la transferencia');
      return;
    }

    this.confirmarPedido('SINPE_MOVIL' as MetodoPago, {});
  }

  confirmarPedido(metodoPago: MetodoPago, datosPago: any): void {
    this.loading.set(true);
    this.error.set('');

    const clienteTemporal = JSON.parse(sessionStorage.getItem('clienteTemporal') || '{}');
    const carritoItems = this.carrito();

    // Preparar datos de la orden
    const ordenData = {
      items: carritoItems.map(item => ({
        idmenuitem: item.menuItem.id,
        cantidad: item.cantidad,
        notas: item.notas || null
      })),
      tipopedido: 'DELIVERY',
      notas: null,
      metodopago: metodoPago,
      subtotal: this.totales().subtotal,
      servicioexpress: this.totales().servicioExpress,
      total: this.totales().total,
      ...datosPago
    };

    // Crear orden
    this.ordenService.create(ordenData).subscribe({
      next: (response: any) => {
        this.loading.set(false);
        
        if (response.success && response.data?.orden) {
          const orden = response.data.orden;
          
          // Guardar número de orden para confirmación
          sessionStorage.setItem('ordenConfirmada', JSON.stringify(orden));
          sessionStorage.removeItem('carritoTemporal');
          sessionStorage.removeItem('totalesTemporal');

          // Enviar link de WhatsApp
          this.enviarLinkWhatsApp(orden.numeropedido, clienteTemporal.telefono);

          this.router.navigate(['/pedidos/confirmacion']);
        } else {
          this.error.set('Error al crear la orden');
          this.notification.error('Error', 'No se pudo procesar el pedido');
        }
      },
      error: (error: any) => {
        this.loading.set(false);
        const errorMessage = error.error?.message || 'Error al procesar el pedido';
        this.error.set(errorMessage);
        this.notification.error('Error', errorMessage);
      }
    });
  }

  enviarLinkWhatsApp(numeroPedido: string, telefono: string): void {
    const baseUrl = window.location.origin;
    const linkSeguimiento = `${baseUrl}/pedidos/seguimiento/${numeroPedido}`;
    
    const mensaje = `🍗 *La Ventanita Gorroles*

¡Gracias por tu pedido!

📋 Número de orden: ${numeroPedido}
🕐 Tiempo estimado: 30-45 min

👇 Consulta el estado de tu pedido aquí:
${linkSeguimiento}

¡Nos vemos pronto! 🚗💨`;

    const urlWhatsApp = `https://wa.me/506${telefono}?text=${encodeURIComponent(mensaje)}`;
    
    // Abrir WhatsApp en nueva ventana
    window.open(urlWhatsApp, '_blank');
  }

  formatearPrecio(precio: number): string {
    return `₡${precio.toLocaleString('es-CR')}`;
  }

  copiarAlPortapapeles(texto: string): void {
    navigator.clipboard.writeText(texto).then(() => {
      this.notification.success('Copiado', 'Texto copiado al portapapeles');
    });
  }
}

