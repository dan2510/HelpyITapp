// src/app/tiquetes/tiquete-form/tiquete-form.ts
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TiqueteService } from '../../share/services/api/tiquete.service';
import { EtiquetaService } from '../../share/services/api/etiqueta.service';
import { UsuarioService } from '../../share/services/api/usuario.service';
import { NotificationService } from '../../share/services/app/notification.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { EtiquetaModel } from '../../share/models/EtiquetaModel';
import { UsuarioModel } from '../../share/models/UsuarioModel';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';

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
    private etiquetaService: EtiquetaService,
    private usuarioService: UsuarioService,
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
      idetiqueta: [null, Validators.required],
      
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

    // ✅ 1. CARGAR USUARIO SOLICITANTE usando UsuarioService
    this.usuarioService.getById(this.ID_USUARIO_FIJO).subscribe({
      next: (response: any) => {
        // El backend devuelve { success: true, data: { usuario: {...} } }
        if (response.success && response.data && response.data.usuario) {
          this.usuarioSolicitante.set(response.data.usuario);
          this.tiqueteForm.patchValue({
            nombreSolicitante: response.data.usuario.nombrecompleto,
            correoSolicitante: response.data.usuario.correo
          });
        } else if (response.id) {
          // Si el backend devuelve directamente el objeto usuario
          this.usuarioSolicitante.set(response);
          this.tiqueteForm.patchValue({
            nombreSolicitante: response.nombrecompleto,
            correoSolicitante: response.correo
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

    // ✅ 3. CARGAR ETIQUETAS usando EtiquetaService
    this.etiquetaService.get().subscribe({
      next: (response: any) => {
        // El backend devuelve { success: true, data: { etiquetas: [...] } }
        let etiquetasData: EtiquetaModel[] = [];
        
        if (Array.isArray(response)) {
          etiquetasData = response;
        } else if (response.success && response.data && response.data.etiquetas) {
          etiquetasData = response.data.etiquetas;
        } else if (response.data && response.data.etiquetas) {
          etiquetasData = response.data.etiquetas;
        }
        
        // Formatear etiquetas para incluir categoría en el formato esperado
        const etiquetasFormateadas = etiquetasData.map(etiq => ({
          ...etiq,
          categoria: etiq.categorias && etiq.categorias.length > 0 
            ? etiq.categorias[0].categoria 
            : (etiq.categoria || null)
        }));
        
        this.etiquetas.set(etiquetasFormateadas);
        this.etiquetasFiltradas.set(etiquetasFormateadas);
        checkAllLoaded();
      },
      error: (error) => {
        this.notification.error('Error', 'No se pudieron cargar las etiquetas');
        checkAllLoaded();
      }
    });
  }

  // Método para mostrar el nombre de la etiqueta en el input
  displayEtiqueta(etiqueta: EtiquetaModel | null): string {
    return etiqueta ? etiqueta.nombre : '';
  }

  // Método llamado cuando se selecciona una etiqueta del autocomplete
  onEtiquetaSelected(event: any): void {
    const etiquetaSeleccionada = event.option.value as EtiquetaModel;
    
    if (etiquetaSeleccionada) {
      // Actualizar el form control con el objeto completo
      this.tiqueteForm.patchValue({
        idetiqueta: etiquetaSeleccionada
      });

      // Procesar la categoría asociada (puede venir en categoria o categorias)
      let categoria: any = null;
      
      // Primero intentar con categoria (objeto directo)
      if (etiquetaSeleccionada.categoria) {
        categoria = etiquetaSeleccionada.categoria;
      } 
      // Si no, intentar con categorias (array de relaciones)
      else if (etiquetaSeleccionada.categorias && etiquetaSeleccionada.categorias.length > 0) {
        categoria = etiquetaSeleccionada.categorias[0]?.categoria;
      }

      if (categoria) {
        this.categoriaSeleccionada.set(categoria.nombre);
        this.tiqueteForm.patchValue({
          categoria: `${categoria.nombre} - ${categoria.descripcion || 'Sin descripción'}`
        });
        this.notification.success('Categoría asignada', `Categoría: ${categoria.nombre}`);
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
        categoria: ''
      });
    }
  }

  filtrarEtiquetas(event: Event): void {
    const input = event.target as HTMLInputElement;
    const filtro = input.value.toLowerCase().trim();
    
    // Si el input está vacío o solo tiene espacios, mostrar todas las etiquetas
    if (!filtro) {
      this.etiquetasFiltradas.set(this.etiquetas());
      return;
    }

    // Filtrar etiquetas por nombre o descripción
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

      // Obtener el ID de la etiqueta (puede ser un objeto EtiquetaModel o un ID)
      const idetiquetaValue = this.tiqueteForm.get('idetiqueta')?.value;
      const idetiqueta = typeof idetiquetaValue === 'object' && idetiquetaValue !== null 
        ? idetiquetaValue.id 
        : idetiquetaValue;

      const formData = {
        titulo: this.tiqueteForm.get('titulo')?.value.trim(),
        descripcion: this.tiqueteForm.get('descripcion')?.value.trim(),
        prioridad: this.tiqueteForm.get('prioridad')?.value,
        idetiqueta: idetiqueta,
        idcliente: this.ID_USUARIO_FIJO,
        imagenes: nombresArchivos // Enviar los nombres de archivos subidos
      };
      
      const url = `${environment.apiURL}/${environment.endPointTiquete}`;

      this.http.post<any>(url, formData).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.loading.set(false);
            Swal.fire({
              icon: 'success',
              title: '¡Éxito!',
              text: 'Ticket creado exitosamente',
              showConfirmButton: false,
              timer: 1500
            }).then(() => {
              this.router.navigate(['/tiquetes', response.data.tiquete.id]);
            });
          } else {
            this.error.set('Error al crear el ticket');
            this.loading.set(false);
          }
        },
        error: (error: any) => {
          const errorMessage = error.error?.message || 'Error al crear el ticket';
          this.error.set(errorMessage);
          this.loading.set(false);
          Swal.fire('Error', errorMessage, 'error');
        }
      });
    } catch (error: any) {
      this.loading.set(false);
      Swal.fire('Error', 'Error al subir los archivos', 'error');
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