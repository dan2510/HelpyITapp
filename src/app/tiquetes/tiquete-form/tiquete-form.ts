// src/app/tiquetes/tiquete-form/tiquete-form.ts
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TiqueteService } from '../../share/services/api/tiquete.service';
import { NotificationService } from '../../share/services/app/notification.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { EtiquetaModel } from '../../share/models/EtiquetaModel';
import { UsuarioModel } from '../../share/models/UsuarioModel';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-tiquete-form',
  standalone: false,
  templateUrl: './tiquete-form.html',
  styleUrl: './tiquete-form.css',
})
export class TiqueteForm implements OnInit {
  
  // ID de usuario fijo (simula autenticación)
  private readonly ID_USUARIO_FIJO = 5; // Juan Pérez

  tiqueteForm!: FormGroup;
  
  protected readonly prioridades = signal<{ id: string; nombre: string }[]>([]);
  protected readonly etiquetas = signal<EtiquetaModel[]>([]);
  protected readonly etiquetasFiltradas = signal<EtiquetaModel[]>([]);
  protected readonly usuarioSolicitante = signal<UsuarioModel | null>(null);
  protected readonly categoriaSeleccionada = signal<string>('');
  protected readonly loading = signal<boolean>(false);
  protected readonly loadingData = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly archivosSeleccionados = signal<File[]>([]);
  protected readonly archivosSubidos = signal<string[]>([]);
  protected readonly uploading = signal<boolean>(false);

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
      
      // Campos de solo lectura para mostrar info del usuario
      nombreSolicitante: [{ value: '', disabled: true }],
      correoSolicitante: [{ value: '', disabled: true }],
      
      // Campos no editables (solo informativos)
      categoria: [{ value: '', disabled: true }],
      fechaCreacion: [{ value: new Date().toLocaleString('es-ES'), disabled: true }],
      estado: [{ value: 'PENDIENTE', disabled: true }]
    });
  }

  private loadInitialData(): void {
    this.loadingData.set(true);
    this.error.set('');

    let completedRequests = 0;
    const totalRequests = 3;

    const checkAllLoaded = () => {
      completedRequests++;
      if (completedRequests === totalRequests) {
        this.loadingData.set(false);
      }
    };

    // ✅ 1. CARGAR USUARIO SOLICITANTE - SIN /api
    const urlUsuario = `${environment.apiURL}/${environment.endPointTiquete}/usuario/${this.ID_USUARIO_FIJO}/info`;
    
    this.http.get<any>(urlUsuario).subscribe({
      next: (response) => {
        if (response.success && response.data.usuario) {
          this.usuarioSolicitante.set(response.data.usuario);
          this.tiqueteForm.patchValue({
            nombreSolicitante: response.data.usuario.nombrecompleto,
            correoSolicitante: response.data.usuario.correo
          });
        } else {
          console.warn('⚠️ Respuesta usuario sin datos válidos');
        }
        checkAllLoaded();
      },
      error: (error) => {
        this.notification.error('Error', 'No se pudo cargar la información del usuario');
        checkAllLoaded();
      }
    });

    // ✅ 2. CARGAR PRIORIDADES - SIN /api
    const urlPrioridades = `${environment.apiURL}/${environment.endPointTiquete}/prioridades`;
    
    this.http.get<any>(urlPrioridades).subscribe({
      next: (response) => {
        if (response.success && response.data.prioridades) {
          this.prioridades.set(response.data.prioridades);
        } else {
          console.warn('⚠️ Respuesta de prioridades sin datos:', response);
        }
        checkAllLoaded();
      },
      error: (error) => {
        this.notification.error('Error', 'No se pudieron cargar las prioridades');
        checkAllLoaded();
      }
    });

    // ✅ 3. CARGAR ETIQUETAS - SIN /api
    const urlEtiquetas = `${environment.apiURL}/${environment.endPointTiquete}/etiquetas`;
    
    this.http.get<any>(urlEtiquetas).subscribe({
      next: (response) => {
        if (response.success && response.data.etiquetas) {
          this.etiquetas.set(response.data.etiquetas);
          this.etiquetasFiltradas.set(response.data.etiquetas);
        } else {
          console.warn('⚠️ Respuesta de etiquetas sin datos:', response);
        }
        checkAllLoaded();
      },
      error: (error) => {
        this.notification.error('Error', 'No se pudieron cargar las etiquetas');
        checkAllLoaded();
      }
    });
  }

  onEtiquetaChange(): void {
    const idetiqueta = this.tiqueteForm.get('idetiqueta')?.value;
    
    if (idetiqueta) {
      const etiquetaSeleccionada = this.etiquetas().find(e => e.id === parseInt(idetiqueta));
      
      if (etiquetaSeleccionada) {
        if (etiquetaSeleccionada.categoria) {
          this.categoriaSeleccionada.set(etiquetaSeleccionada.categoria.nombre);
          this.tiqueteForm.patchValue({
            categoria: `${etiquetaSeleccionada.categoria.nombre} - ${etiquetaSeleccionada.categoria.descripcion || 'Sin descripción'}`
          });
          this.notification.success('Categoría asignada', `Categoría: ${etiquetaSeleccionada.categoria.nombre}`);
        } else {
          console.warn('⚠️ Etiqueta sin categoría asociada');
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

  async onSubmit(): Promise<void> {
    if (this.tiqueteForm.invalid) {
      this.markFormGroupTouched(this.tiqueteForm);
      this.notification.warning('Validación', 'Por favor complete todos los campos requeridos');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      // Primero subir los archivos si hay alguno
      let nombresArchivos: string[] = [];
      if (this.archivosSeleccionados().length > 0) {
        nombresArchivos = await this.subirArchivos();
      }

      const formData = {
        titulo: this.tiqueteForm.get('titulo')?.value.trim(),
        descripcion: this.tiqueteForm.get('descripcion')?.value.trim(),
        prioridad: this.tiqueteForm.get('prioridad')?.value,
        idetiqueta: this.tiqueteForm.get('idetiqueta')?.value,
        idcliente: this.ID_USUARIO_FIJO,
        imagenes: nombresArchivos // Enviar los nombres de archivos subidos
      };
      
      const url = `${environment.apiURL}/${environment.endPointTiquete}`;

      this.http.post<any>(url, formData).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.notification.success('Éxito', 'Ticket creado exitosamente');
            setTimeout(() => {
              this.router.navigate(['/tiquetes', response.data.tiquete.id]);
            }, 1000);
          } else {
            this.error.set('Error al crear el ticket');
            this.loading.set(false);
          }
        },
        error: (error: any) => {
          const errorMessage = error.error?.message || 'Error al crear el ticket';
          this.error.set(errorMessage);
          this.loading.set(false);
          this.notification.error('Error', errorMessage);
        }
      });
    } catch (error: any) {
      this.loading.set(false);
      this.notification.error('Error', 'Error al subir los archivos');
    }
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

  // Métodos para manejo de archivos
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const nuevosArchivos = Array.from(input.files);
      
      // Validar tamaño máximo (2MB)
      const archivosValidos = nuevosArchivos.filter(archivo => {
        if (archivo.size > 2 * 1024 * 1024) {
          this.notification.warning('Archivo muy grande', `${archivo.name} excede el tamaño máximo de 2MB`);
          return false;
        }
        return true;
      });

      this.archivosSeleccionados.set([...this.archivosSeleccionados(), ...archivosValidos]);
    }
    // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
    input.value = '';
  }

  removerArchivo(archivo: File): void {
    const archivos = this.archivosSeleccionados().filter(f => f !== archivo);
    this.archivosSeleccionados.set(archivos);
  }

  esImagen(nombreArchivo: string): boolean {
    const extension = nombreArchivo.toLowerCase().split('.').pop();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension || '');
  }

  getFilePreview(archivo: File): string {
    if (this.esImagen(archivo.name)) {
      return URL.createObjectURL(archivo);
    }
    return '';
  }

  onPreviewError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  private async subirArchivos(): Promise<string[]> {
    if (this.archivosSeleccionados().length === 0) {
      return [];
    }

    this.uploading.set(true);
    const nombresArchivos: string[] = [];

    try {
      // Subir cada archivo individualmente
      for (const archivo of this.archivosSeleccionados()) {
        const formData = new FormData();
        formData.append('file', archivo);

        const response = await firstValueFrom(
          this.http.post<any>(`${environment.apiURL}/file/upload`, formData)
        );

        if (response && response.fileName) {
          nombresArchivos.push(response.fileName);
        }
      }

      this.archivosSubidos.set(nombresArchivos);
      return nombresArchivos;
    } catch (error: any) {
      this.notification.error('Error', 'No se pudieron subir algunos archivos');
      throw error;
    } finally {
      this.uploading.set(false);
    }
  }
}