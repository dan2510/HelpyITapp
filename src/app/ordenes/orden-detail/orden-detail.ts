// src/app/ordenes/orden-detail/orden-detail.ts
import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrdenService } from '../../share/services/api/orden.service';
import { OrdenModel } from '../../share/models/OrdenModel';
import { UsuarioModel } from '../../share/models/UsuarioModel';
import { NotificationService } from '../../share/services/app/notification.service';
import { EstadoOrden, TipoPedido, RoleNombre, TipoHistorial } from '../../share/models/EnumsModel';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../../share/services/app/authentication.service';

@Component({
  selector: 'app-orden-detail',
  standalone: false,
  templateUrl: './orden-detail.html',
  styleUrl: './orden-detail.css',
})
export class OrdenDetail implements OnInit {
  protected readonly orden = signal<OrdenModel | null>(null);
  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly ordenId = signal<number>(0);

  // Formulario para actualizar estado
  estadoForm!: FormGroup;
  protected readonly archivosSeleccionados = signal<File[]>([]);
  protected readonly archivosSubidos = signal<string[]>([]);
  protected readonly uploading = signal<boolean>(false);
  protected readonly authService = inject(AuthenticationService);
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private ordenService: OrdenService,
    private notification: NotificationService,
    private http: HttpClient
  ) {
    this.initEstadoForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = parseInt(params['id']);
      if (id && !isNaN(id)) {
        this.ordenId.set(id);
        this.loadOrdenDetail(id);
      } else {
        this.error.set('ID de orden inválido');
        this.notification.error('Error', 'ID de orden inválido');
      }
    });
  }

  loadOrdenDetail(id: number): void {
    this.loading.set(true);
    this.error.set('');

    this.ordenService.getById(id).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.orden.set(response.data.orden);
          // Inicializar el formulario con los estados disponibles
          this.initEstadoForm();
          console.log('Detalle de la orden cargado:', response.data.orden);
        } else {
          this.error.set('Error en la respuesta del servidor');
        }
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('Error al cargar detalle de la orden:', error);
        this.error.set('No se pudo cargar la información de la orden');
        this.loading.set(false);
        if (error.status === 401) {
          this.notification.error('Error', 'Debe iniciar sesión');
          this.router.navigate(['/usuario/login']);
        } else {
          this.notification.error('Error', 'No se pudo cargar la información de la orden');
        }
      }
    });
  }


  regresarAlListado(): void {
    this.router.navigate(['/ordenes']);
  }

  retry(): void {
    if (this.ordenId() > 0) {
      this.loadOrdenDetail(this.ordenId());
    }
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

  formatearFecha(fecha: Date | string | null | undefined): string {
    if (!fecha) {
      return 'No disponible';
    }
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatearFechaCorta(fecha: Date | string | null | undefined): string {
    if (!fecha) return 'N/A';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getEstrellas(calificacion: number): string[] {
    const estrellas = [];
    for (let i = 1; i <= 5; i++) {
      estrellas.push(i <= calificacion ? 'star' : 'star_border');
    }
    return estrellas;
  }

  getColorCalificacion(calificacion: number): string {
    if (calificacion >= 4) return 'success';
    if (calificacion >= 3) return 'primary';
    if (calificacion >= 2) return 'warn';
    return 'error';
  }

  // ========== MÉTODOS PARA ACTUALIZAR ESTADO ==========

  initEstadoForm(): void {
    const orden = this.orden();
    const estadoActual = orden?.estado || EstadoOrden.PENDIENTE;
    
    this.estadoForm = this.fb.group({
      nuevoEstado: [estadoActual, Validators.required],
      observacion: ['', [Validators.required, Validators.minLength(10)]],
      tipoObservacion: [TipoHistorial.CAMBIO_ESTADO, Validators.required]
    });
  }

  cancelarActualizacionEstado(): void {
    this.estadoForm.reset();
    this.archivosSeleccionados.set([]);
    this.archivosSubidos.set([]);
    this.initEstadoForm();
  }

  getEstadosDisponibles(estadoActual: EstadoOrden | string): EstadoOrden[] {
    const usuario = this.authService.usuario();
    const rol = usuario?.rol?.nombre;

    // Si es cliente, solo puede ver estados
    if (rol === RoleNombre.CLIENTE) {
      return [];
    }

    // Para ADMIN, flujo normal de restaurante
    const flujo: { [key: string]: EstadoOrden[] } = {
      [EstadoOrden.PENDIENTE]: [EstadoOrden.EN_PREPARACION, EstadoOrden.CANCELADO],
      [EstadoOrden.EN_PREPARACION]: [EstadoOrden.LISTO, EstadoOrden.CANCELADO],
      [EstadoOrden.LISTO]: [EstadoOrden.ENTREGADO, EstadoOrden.CANCELADO],
      [EstadoOrden.ENTREGADO]: [],
      [EstadoOrden.CANCELADO]: []
    };

    return flujo[estadoActual as string] || [];
  }

  getTodosEstadosDisponibles(): { actual: EstadoOrden | string; siguiente: EstadoOrden | string | null; retroceso: EstadoOrden | string | null } {
    const orden = this.orden();
    if (!orden) {
      return { actual: EstadoOrden.PENDIENTE, siguiente: null, retroceso: null };
    }

    const estadoActual = (orden.estado || EstadoOrden.PENDIENTE) as EstadoOrden;
    const estadosAvance = this.getEstadosDisponibles(estadoActual);
    const estadoSiguiente = estadosAvance.length > 0 ? estadosAvance[0] : null;

    return {
      actual: estadoActual,
      siguiente: estadoSiguiente,
      retroceso: null // No se permite retroceder en restaurante
    };
  }

  puedeActualizarEstado(): boolean {
    const orden = this.orden();
    if (!orden) return false;

    const usuario = this.authService.usuario();
    const rol = usuario?.rol?.nombre;

    // Solo ADMIN puede actualizar estados
    if (rol !== RoleNombre.ADMIN) {
      return false;
    }

    // No se puede actualizar si está entregada o cancelada
    if (orden.estado === EstadoOrden.ENTREGADO || orden.estado === EstadoOrden.CANCELADO) {
      return false;
    }

    return true;
  }

  actualizarEstado(): void {
    if (this.estadoForm.invalid) {
      this.notification.warning('Validación', 'Por favor complete todos los campos requeridos');
      return;
    }

    const ordenActual = this.orden();
    if (!ordenActual) return;

    const nuevoEstado = this.estadoForm.get('nuevoEstado')?.value;
    const observacion = this.estadoForm.get('observacion')?.value;
    const estadoCambia = nuevoEstado !== ordenActual.estado;

    if (!estadoCambia) {
      this.notification.warning('Validación', 'Debe seleccionar un estado diferente al actual');
      return;
    }

    // Validar que solo se puede avanzar al siguiente estado
    const estadosDisponibles = this.getEstadosDisponibles((ordenActual.estado || EstadoOrden.PENDIENTE) as EstadoOrden);
    if (!estadosDisponibles.includes(nuevoEstado)) {
      this.notification.warning('Validación', 'Solo se puede avanzar al siguiente estado en el flujo');
      return;
    }

    this.loading.set(true);

    const updateData = {
      estado: nuevoEstado,
      observacion: observacion
    };

    this.http.patch<any>(
      `${environment.apiURL}/${environment.endPointOrden}/${ordenActual.id}/estado`,
      updateData
    ).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.notification.success('Éxito', 'Estado actualizado correctamente');
          this.archivosSeleccionados.set([]);
          this.archivosSubidos.set([]);
          this.estadoForm.reset();
          this.loadOrdenDetail(ordenActual.id);
        } else {
          this.notification.error('Error', 'Error al actualizar el estado');
          this.loading.set(false);
        }
      },
      error: (error: any) => {
        console.error('Error al actualizar estado:', error);
        this.loading.set(false);
        const errorMessage = error.error?.message || 'Error al actualizar el estado';
        this.notification.error('Error', errorMessage);
      }
    });
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

  // Obtener historiales filtrados
  getHistorialesFiltrados(): any[] {
    const orden = this.orden();
    if (!orden || !orden.historiales) {
      return [];
    }
    return orden.historiales.filter((hist: any) => 
      hist.tipo === TipoHistorial.CAMBIO_ESTADO || 
      hist.tipo === TipoHistorial.COMENTARIO_CLIENTE
    );
  }
}

