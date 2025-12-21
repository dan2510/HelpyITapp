// src/app/ordenes/orden-form/orden-form.ts
import { Component, OnInit, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OrdenService } from '../../share/services/api/orden.service';
import { MenuService } from '../../share/services/api/menu.service';
import { NotificationService } from '../../share/services/app/notification.service';
import { AuthenticationService } from '../../share/services/app/authentication.service';
import { TipoPedido, RoleNombre } from '../../share/models/EnumsModel';
import { MenuItemModel } from '../../share/models/MenuItemModel';
import { UsuarioModel } from '../../share/models/UsuarioModel';

interface ItemSeleccionado {
  idmenuitem: number;
  cantidad: number;
  precio: number;
  subtotal: number;
  notas?: string;
  menuItem?: MenuItemModel;
}

@Component({
  selector: 'app-orden-form',
  standalone: false,
  templateUrl: './orden-form.html',
  styleUrl: './orden-form.css',
})
export class OrdenForm implements OnInit {
  ordenForm!: FormGroup;
  
  protected readonly menuItems = signal<MenuItemModel[]>([]);
  protected readonly menuPorCategoria = signal<any>({});
  protected readonly itemsSeleccionados = signal<ItemSeleccionado[]>([]);
  protected readonly loading = signal<boolean>(false);
  protected readonly loadingData = signal<boolean>(false);
  protected readonly error = signal<string>('');

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private ordenService: OrdenService,
    private menuService: MenuService,
    private notification: NotificationService,
    private authService: AuthenticationService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    // Verificar autenticación
    if (!this.authService.authenticated()) {
      this.router.navigate(['/usuario/login']);
      return;
    }

    // Verificar que el usuario puede crear órdenes (cliente o admin)
    const usuario = this.authService.usuario();
    if (usuario && usuario.rol && usuario.rol.nombre !== RoleNombre.CLIENTE && usuario.rol.nombre !== RoleNombre.ADMIN) {
      this.notification.warning(
        'Advertencia', 
        'Solo los clientes pueden crear órdenes'
      );
      this.router.navigate(['/inicio']);
      return;
    }

    this.loadInitialData();
  }

  private initForm(): void {
    this.ordenForm = this.fb.group({
      tipopedido: [TipoPedido.COMER_AQUI, Validators.required],
      notas: ['', [Validators.maxLength(500)]],
    });
  }

  private loadInitialData(): void {
    this.loadingData.set(true);
    this.error.set('');

    // Cargar menú
    this.menuService.getMenuPorCategoria().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.menuItems.set(response.data.items || []);
          this.menuPorCategoria.set(response.data.menu || {});
        } else if (Array.isArray(response)) {
          this.menuItems.set(response);
        }
        this.loadingData.set(false);
      },
      error: (error: any) => {
        console.error('Error al cargar menú:', error);
        this.error.set('Error al cargar el menú');
        this.loadingData.set(false);
        this.notification.error('Error', 'No se pudo cargar el menú');
      }
    });

  }

  agregarItem(item: MenuItemModel): void {
    if (!item.disponible || !item.activo) {
      this.notification.warning('Advertencia', 'Este item no está disponible');
      return;
    }

    const items = this.itemsSeleccionados();
    const itemExistente = items.find(i => i.idmenuitem === item.id);

    if (itemExistente) {
      // Incrementar cantidad
      itemExistente.cantidad++;
      itemExistente.subtotal = itemExistente.cantidad * itemExistente.precio;
    } else {
      // Agregar nuevo item
      const nuevoItem: ItemSeleccionado = {
        idmenuitem: item.id,
        cantidad: 1,
        precio: Number(item.precio),
        subtotal: Number(item.precio),
        menuItem: item
      };
      items.push(nuevoItem);
    }

    this.itemsSeleccionados.set([...items]);
  }

  removerItem(itemId: number): void {
    const items = this.itemsSeleccionados().filter(i => i.idmenuitem !== itemId);
    this.itemsSeleccionados.set(items);
  }

  actualizarCantidad(itemId: number, cantidad: number): void {
    if (cantidad <= 0) {
      this.removerItem(itemId);
      return;
    }

    const items = this.itemsSeleccionados();
    const item = items.find(i => i.idmenuitem === itemId);
    if (item) {
      item.cantidad = cantidad;
      item.subtotal = item.cantidad * item.precio;
      this.itemsSeleccionados.set([...items]);
    }
  }

  actualizarNotasItem(itemId: number, notas: string): void {
    const items = this.itemsSeleccionados();
    const item = items.find(i => i.idmenuitem === itemId);
    if (item) {
      item.notas = notas || undefined;
      this.itemsSeleccionados.set([...items]);
    }
  }

  calcularTotal(): number {
    return this.itemsSeleccionados().reduce((total, item) => total + item.subtotal, 0);
  }

  esAdmin(): boolean {
    const usuario = this.authService.usuario();
    return usuario?.rol?.nombre === RoleNombre.ADMIN;
  }

  onSubmit(): void {
    if (this.ordenForm.invalid) {
      this.notification.warning('Validación', 'Por favor complete todos los campos requeridos');
      return;
    }

    if (this.itemsSeleccionados().length === 0) {
      this.notification.warning('Validación', 'Debe agregar al menos un item a la orden');
      return;
    }

    this.loading.set(true);

    const formData = {
      items: this.itemsSeleccionados().map(item => ({
        idmenuitem: item.idmenuitem,
        cantidad: item.cantidad,
        notas: item.notas || null
      })),
      tipopedido: this.ordenForm.get('tipopedido')?.value,
      notas: this.ordenForm.get('notas')?.value?.trim() || null,
      idmesero: null // Ya no se asignan meseros
    };

    this.ordenService.create(formData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.notification.success('Éxito', 'Orden creada correctamente');
          this.router.navigate(['/ordenes', response.data.orden.id]);
        } else {
          this.notification.error('Error', 'Error al crear la orden');
          this.loading.set(false);
        }
      },
      error: (error: any) => {
        console.error('Error al crear orden:', error);
        this.loading.set(false);
        const errorMessage = error.error?.message || 'Error al crear la orden';
        this.notification.error('Error', errorMessage);
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/ordenes']);
  }

  getTipoPedidoNombre(tipo: TipoPedido | string): string {
    const tipos: { [key: string]: string } = {
      'COMER_AQUI': 'Comer Aquí',
      'PARA_LLEVAR': 'Para Llevar',
      'DELIVERY': 'Delivery'
    };
    return tipos[tipo] || tipo;
  }

  // Obtener claves del objeto menuPorCategoria para iterar en el template
  getCategoriasKeys(): string[] {
    return Object.keys(this.menuPorCategoria());
  }
}

