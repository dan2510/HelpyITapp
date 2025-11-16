// src/app/tiquetes/tiquete-form/tiquete-form.ts
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TiqueteService } from '../../share/services/api/tiquete.service';
import { NotificationService } from '../../share/services/app/notification.service';
import { Prioridad } from '../../share/models/EnumsModel';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

interface PrioridadOption {
  id: string;
  nombre: string;
}

interface EtiquetaOption {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: {
    id: number;
    nombre: string;
    descripcion: string;
  } | null;
}

interface UsuarioInfo {
  id: number;
  nombrecompleto: string;
  correo: string;
}

interface ClienteOption {
  id: number;
  nombrecompleto: string;
  correo: string;
}

@Component({
  selector: 'app-tiquete-form',
  standalone: false,
  templateUrl: './tiquete-form.html',
  styleUrl: './tiquete-form.css',
})
export class TiqueteForm implements OnInit {
  // ID de usuario fijo (simula autenticación)
  // CAMBIAR ESTE VALOR: 1=Admin, 5=Cliente, 3=Técnico
  private readonly ID_USUARIO_FIJO = 5; // Cliente por defecto para crear tickets

  tiqueteForm!: FormGroup;
  
  protected readonly prioridades = signal<PrioridadOption[]>([]);
  protected readonly etiquetas = signal<EtiquetaOption[]>([]);
  protected readonly etiquetasFiltradas = signal<EtiquetaOption[]>([]);
  protected readonly clientes = signal<ClienteOption[]>([]);
  protected readonly categoriaSeleccionada = signal<string>('');
  protected readonly loading = signal<boolean>(false);
  protected readonly loadingData = signal<boolean>(false);
  protected readonly error = signal<string>('');

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private tiqueteService: TiqueteService,
    private notification: NotificationService,
    private http: HttpClient
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  private initForm(): void {
    this.tiqueteForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
      prioridad: ['', Validators.required],
      idetiqueta: ['', Validators.required],
      // Campos editables para seleccionar cliente
      idcliente: ['', Validators.required],
      correoSolicitante: [{ value: '', disabled: true }],
      // Campos no editables (solo informativos)
      categoria: [{ value: '', disabled: true }],
      fechaCreacion: [{ value: new Date().toLocaleString('es-ES'), disabled: true }],
      estado: [{ value: 'PENDIENTE', disabled: true }]
    });

    // Escuchar cambios en la selección de cliente para cargar el correo
    this.tiqueteForm.get('idcliente')?.valueChanges.subscribe(clienteId => {
      this.onClienteChange(clienteId);
    });
  }

  private loadInitialData(): void {
    this.loadingData.set(true);
    this.error.set('');

    // Cargar prioridades
    this.http.get<any>(`${environment.apiURL}/api/${environment.endPointTiquete}/prioridades`).subscribe({
      next: (response) => {
        if (response.success && response.data.prioridades) {
          this.prioridades.set(response.data.prioridades);
          console.log('Prioridades cargadas:', response.data.prioridades);
        } else {
          console.warn('Respuesta de prioridades sin datos:', response);
        }
      },
      error: (error) => {
        console.error('Error al cargar prioridades:', error);
        this.notification.error('Error', 'No se pudieron cargar las prioridades');
        this.error.set('Error al cargar las prioridades');
      }
    });

    // Cargar etiquetas
    this.http.get<any>(`${environment.apiURL}/api/${environment.endPointTiquete}/etiquetas`).subscribe({
      next: (response) => {
        if (response.success && response.data.etiquetas) {
          this.etiquetas.set(response.data.etiquetas);
          this.etiquetasFiltradas.set(response.data.etiquetas);
          console.log('Etiquetas cargadas:', response.data.etiquetas);
        } else {
          console.warn('Respuesta de etiquetas sin datos:', response);
        }
      },
      error: (error) => {
        console.error('Error al cargar etiquetas:', error);
        this.notification.error('Error', 'No se pudieron cargar las etiquetas');
        this.error.set('Error al cargar las etiquetas');
      }
    });

    // Cargar lista de clientes
    this.http.get<any>(`${environment.apiURL}/api/${environment.endPointTiquete}/clientes`).subscribe({
      next: (response) => {
        if (response.success && response.data.clientes) {
          this.clientes.set(response.data.clientes);
          console.log('Clientes cargados:', response.data.clientes);
        } else {
          console.warn('Respuesta de clientes sin datos:', response);
        }
        this.loadingData.set(false);
      },
      error: (error) => {
        console.error('Error al cargar clientes:', error);
        this.notification.error('Error', 'No se pudieron cargar los clientes');
        this.error.set('Error al cargar los clientes');
        this.loadingData.set(false);
      }
    });
  }

  onClienteChange(clienteId: string | number | null): void {
    if (clienteId) {
      const clienteSeleccionado = this.clientes().find(c => c.id === parseInt(clienteId.toString()));
      if (clienteSeleccionado) {
        this.tiqueteForm.patchValue({
          correoSolicitante: clienteSeleccionado.correo
        });
        console.log('Cliente seleccionado:', clienteSeleccionado);
      }
    } else {
      this.tiqueteForm.patchValue({
        correoSolicitante: ''
      });
    }
  }

  onEtiquetaChange(): void {
    const idetiqueta = this.tiqueteForm.get('idetiqueta')?.value;
    console.log('Etiqueta seleccionada ID:', idetiqueta);
    
    if (idetiqueta) {
      const etiquetaSeleccionada = this.etiquetas().find(e => e.id === parseInt(idetiqueta));
      console.log('Etiqueta encontrada:', etiquetaSeleccionada);
      
      if (etiquetaSeleccionada) {
        if (etiquetaSeleccionada.categoria) {
          this.categoriaSeleccionada.set(etiquetaSeleccionada.categoria.nombre);
          this.tiqueteForm.patchValue({
            categoria: `${etiquetaSeleccionada.categoria.nombre} - ${etiquetaSeleccionada.categoria.descripcion || 'Sin descripción'}`
          });
          this.notification.success('Categoría asignada', `Categoría: ${etiquetaSeleccionada.categoria.nombre}`);
        } else {
          this.categoriaSeleccionada.set('');
          this.tiqueteForm.patchValue({
            categoria: 'No disponible - Esta etiqueta no tiene categoría asociada'
          });
          this.notification.warning('Advertencia', 'La etiqueta seleccionada no tiene categoría asociada');
        }
      } else {
        this.categoriaSeleccionada.set('');
        this.tiqueteForm.patchValue({
          categoria: 'Error al encontrar la etiqueta'
        });
      }
    } else {
      this.categoriaSeleccionada.set('');
      this.tiqueteForm.patchValue({
        categoria: ''
      });
    }
  }

  filtrarEtiquetas(event: Event): void {
    const input = event.target as HTMLInputElement;
    const filtro = input.value.toLowerCase().trim();
    
    if (!filtro) {
      this.etiquetasFiltradas.set(this.etiquetas());
      return;
    }

    const filtradas = this.etiquetas().filter(etiqueta =>
      etiqueta.nombre.toLowerCase().includes(filtro) ||
      etiqueta.descripcion?.toLowerCase().includes(filtro)
    );
    
    this.etiquetasFiltradas.set(filtradas);
  }

  onSubmit(): void {
    if (this.tiqueteForm.invalid) {
      this.markFormGroupTouched(this.tiqueteForm);
      this.notification.warning('Validación', 'Por favor complete todos los campos requeridos');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const formData = {
      titulo: this.tiqueteForm.get('titulo')?.value.trim(),
      descripcion: this.tiqueteForm.get('descripcion')?.value.trim(),
      prioridad: this.tiqueteForm.get('prioridad')?.value,
      idetiqueta: this.tiqueteForm.get('idetiqueta')?.value,
      idcliente: this.tiqueteForm.get('idcliente')?.value
    };

    this.http.post<any>(`${environment.apiURL}/api/${environment.endPointTiquete}`, formData).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.notification.success('Éxito', 'Ticket creado exitosamente');
          // Redirigir al detalle del ticket creado
          setTimeout(() => {
            this.router.navigate(['/tiquetes', response.data.tiquete.id]);
          }, 1000);
        } else {
          this.error.set('Error al crear el ticket');
          this.loading.set(false);
        }
      },
      error: (error: any) => {
        console.error('Error al crear ticket:', error);
        const errorMessage = error.error?.message || 'Error al crear el ticket';
        this.error.set(errorMessage);
        this.loading.set(false);
        this.notification.error('Error', errorMessage);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/tiquetes']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.tiqueteForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `Mínimo ${minLength} caracteres`;
    }
    if (control?.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength'].requiredLength;
      return `Máximo ${maxLength} caracteres`;
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.tiqueteForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getPrioridadIcon(prioridadId: string): string {
    switch (prioridadId) {
      case 'BAJA': return 'arrow_downward';
      case 'MEDIA': return 'remove';
      case 'ALTA': return 'arrow_upward';
      case 'CRITICA': return 'priority_high';
      default: return 'help';
    }
  }
}

