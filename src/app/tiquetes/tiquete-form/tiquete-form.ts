// src/app/tiquetes/tiquete-form/tiquete-form.ts
import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TiqueteService } from '../../share/services/api/tiquete.service';
import { EtiquetaService } from '../../share/services/api/etiqueta.service';
import { NotificationService } from '../../share/services/app/notification.service';
import { AuthenticationService } from '../../share/services/app/authentication.service';
import { TranslationService } from '../../share/services/app/translation.service';
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
export class TiqueteForm implements OnInit, OnDestroy {

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
  private translationService = inject(TranslationService);
  private previewUrls = new Map<File, string>(); // Cache de URLs de preview

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private tiqueteService: TiqueteService,
    private etiquetaService: EtiquetaService,
    private notification: NotificationService,
    private authService: AuthenticationService,
    private http: HttpClient
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    // Verificar autenticación
    if (!this.authService.authenticated()) {
      this.router.navigate(['/usuario/login']);
      return;
    }

    // Verificar que el usuario puede crear tiquetes (cliente o admin)
    const usuario = this.authService.usuario();
    if (usuario && usuario.rol && usuario.rol.nombre !== 'CLIENTE' && usuario.rol.nombre !== 'ADMIN') {
      this.notification.warning(
        this.translationService.translate('COMMON.WARNING'), 
        this.translationService.translate('TICKETS.ONLY_CLIENTS_CAN_CREATE')
      );
      this.router.navigate(['/inicio']);
      return;
    }

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

    // Obtener usuario autenticado
    const usuario = this.authService.usuario();
    if (usuario) {
      this.usuarioSolicitante.set(usuario);
      this.tiqueteForm.patchValue({
        nombreSolicitante: usuario.nombrecompleto,
        correoSolicitante: usuario.correo
      });
    } else {
      // Si no hay usuario pero hay token, cargar perfil
      this.authService.getUserProfile().subscribe({
        next: (user) => {
          if (user) {
            this.usuarioSolicitante.set(user);
            this.tiqueteForm.patchValue({
              nombreSolicitante: user.nombrecompleto,
              correoSolicitante: user.correo
            });
          }
        }
      });
    }

    let completedRequests = 0;
    const totalRequests = 2; // Solo prioridades y etiquetas

    const checkAllLoaded = () => {
      completedRequests++;
      if (completedRequests === totalRequests) {
        this.loadingData.set(false);
      }
    };

    //  1. CARGAR PRIORIDADES
    this.tiqueteService.getMethod('prioridades').subscribe({
      next: (response: any) => {
        try {
          let prioridadesData: { id: string; nombre: string }[] = [];
          
          // Manejar diferentes formatos de respuesta
          if (response && response.success && response.data) {
            if (response.data.prioridades && Array.isArray(response.data.prioridades)) {
              prioridadesData = response.data.prioridades;
            } else if (Array.isArray(response.data)) {
              prioridadesData = response.data;
            }
          } else if (Array.isArray(response)) {
            prioridadesData = response;
          } else if (response && response.data && Array.isArray(response.data)) {
            prioridadesData = response.data;
          }
          
          if (prioridadesData.length > 0) {
            this.prioridades.set(prioridadesData);
          } else {
            console.warn('No se encontraron prioridades en la respuesta:', response);
            // Prioridades por defecto si no hay respuesta
            this.prioridades.set([
              { id: 'BAJA', nombre: 'Baja' },
              { id: 'MEDIA', nombre: 'Media' },
              { id: 'ALTA', nombre: 'Alta' },
              { id: 'CRITICA', nombre: 'Crítica' }
            ]);
          }
        } catch (error) {
          console.error('Error al procesar prioridades:', error);
          // Prioridades por defecto en caso de error
          this.prioridades.set([
            { id: 'BAJA', nombre: 'Baja' },
            { id: 'MEDIA', nombre: 'Media' },
            { id: 'ALTA', nombre: 'Alta' },
            { id: 'CRITICA', nombre: 'Crítica' }
          ]);
        }
        checkAllLoaded();
      },
      error: (error) => {
        console.error('Error al cargar prioridades:', error);
        // Prioridades por defecto en caso de error
        this.prioridades.set([
          { id: 'BAJA', nombre: 'Baja' },
          { id: 'MEDIA', nombre: 'Media' },
          { id: 'ALTA', nombre: 'Alta' },
          { id: 'CRITICA', nombre: 'Crítica' }
        ]);
        checkAllLoaded();
      }
    });

    //  2. CARGAR ETIQUETAS
    this.etiquetaService.get().subscribe({
      next: (response: any) => {
        try {
          let etiquetasData: EtiquetaModel[] = [];
          
          // Manejar diferentes formatos de respuesta
          if (Array.isArray(response)) {
            etiquetasData = response;
          } else if (response && response.data && Array.isArray(response.data)) {
            etiquetasData = response.data;
          } else if (response && response.success && response.data) {
            if (Array.isArray(response.data)) {
              etiquetasData = response.data;
            } else if (response.data.etiquetas && Array.isArray(response.data.etiquetas)) {
              etiquetasData = response.data.etiquetas;
            }
          }
          
          if (etiquetasData.length > 0) {
            this.etiquetas.set(etiquetasData);
            this.etiquetasFiltradas.set(etiquetasData);
          } else {
            console.warn('No se encontraron etiquetas en la respuesta:', response);
            this.etiquetas.set([]);
            this.etiquetasFiltradas.set([]);
          }
        } catch (error) {
          console.error('Error al procesar etiquetas:', error);
          this.etiquetas.set([]);
          this.etiquetasFiltradas.set([]);
        }
        checkAllLoaded();
      },
      error: (error) => {
        console.error('Error al cargar etiquetas:', error);
        this.etiquetas.set([]);
        this.etiquetasFiltradas.set([]);
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
        console.warn('Etiqueta sin categoría asociada');
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
      this.notification.warning(
        this.translationService.translate('COMMON.WARNING'), 
        this.translationService.translate('VALIDATION.COMPLETE_REQUIRED_FIELDS')
      );
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
        imagenes: nombresArchivos // Enviar los nombres de archivos subidos
        // idcliente ya no se envía, se obtiene del usuario autenticado en el backend
      };
      
      const url = `${environment.apiURL}/${environment.endPointTiquete}`;

      this.http.post<any>(url, formData).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.loading.set(false);
            Swal.fire({
              icon: 'success',
              title: this.translationService.translate('COMMON.SUCCESS'),
              text: this.translationService.translate('TICKETS.TICKET_CREATED_SUCCESS'),
              showConfirmButton: false,
              timer: 1500
            }).then(() => {
              this.router.navigate(['/tiquetes', response.data.tiquete.id]);
            });
          } else {
            this.error.set(this.translationService.translate('TICKETS.ERROR_CREATING_TICKET'));
            this.loading.set(false);
          }
        },
        error: (error: any) => {
          const errorMessage = error.error?.message || this.translationService.translate('TICKETS.ERROR_CREATING_TICKET');
          this.error.set(errorMessage);
          this.loading.set(false);
          Swal.fire(
            this.translationService.translate('COMMON.ERROR'), 
            errorMessage, 
            'error'
          );
        }
      });
    } catch (error: any) {
      this.loading.set(false);
      Swal.fire(
        this.translationService.translate('COMMON.ERROR'), 
        this.translationService.translate('TICKETS.ERROR_UPLOADING_FILES'), 
        'error'
      );
    }
  }

  onCancel(): void {
    // Limpiar todas las URLs de preview antes de salir
    this.previewUrls.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error al revocar URL:', error);
      }
    });
    this.previewUrls.clear();
    this.router.navigate(['/tiquetes']);
  }

  ngOnDestroy(): void {
    // Limpiar todas las URLs de preview al destruir el componente
    this.previewUrls.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error al revocar URL:', error);
      }
    });
    this.previewUrls.clear();
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
      return this.translationService.translate('VALIDATION.FIELD_REQUIRED');
    }
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return this.translationService.translate('VALIDATION.MIN_LENGTH', { min: minLength });
    }
    if (control?.hasError('maxlength')) {
      const maxLength = control.errors?.['maxlength'].requiredLength;
      return this.translationService.translate('VALIDATION.MAX_LENGTH', { max: maxLength });
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
          this.notification.warning(
            this.translationService.translate('COMMON.WARNING'), 
            this.translationService.translate('TICKETS.FILE_TOO_LARGE', { fileName: archivo.name })
          );
          return false;
        }
        return true;
      });

      // Crear previews para las imágenes
      archivosValidos.forEach(archivo => {
        if (this.esImagen(archivo.name) && !this.previewUrls.has(archivo)) {
          try {
            const url = URL.createObjectURL(archivo);
            this.previewUrls.set(archivo, url);
          } catch (error) {
            console.error('Error al crear preview para', archivo.name, error);
          }
        }
      });

      this.archivosSeleccionados.set([...this.archivosSeleccionados(), ...archivosValidos]);
    }
    // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
    input.value = '';
  }

  removerArchivo(archivo: File): void {
    // Liberar la URL del objeto si existe
    if (this.previewUrls.has(archivo)) {
      try {
        URL.revokeObjectURL(this.previewUrls.get(archivo)!);
        this.previewUrls.delete(archivo);
      } catch (error) {
        console.error('Error al revocar URL del objeto:', error);
      }
    }
    
    const archivos = this.archivosSeleccionados().filter(f => f !== archivo);
    this.archivosSeleccionados.set(archivos);
  }

  esImagen(nombreArchivo: string): boolean {
    const extension = nombreArchivo.toLowerCase().split('.').pop();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension || '');
  }

  getFilePreview(archivo: File): string {
    if (this.esImagen(archivo.name)) {
      // Usar la URL del cache si existe
      if (this.previewUrls.has(archivo)) {
        return this.previewUrls.get(archivo)!;
      }
      // Si no existe, crear una nueva
      try {
        const url = URL.createObjectURL(archivo);
        this.previewUrls.set(archivo, url);
        return url;
      } catch (error) {
        console.error('Error al crear preview de imagen:', error);
        return '';
      }
    }
    return '';
  }

  onPreviewError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.style.display = 'none';
      // Intentar liberar la URL del objeto si existe
      if (img.src && img.src.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(img.src);
        } catch (error) {
          console.error('Error al revocar URL del objeto:', error);
        }
      }
    }
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
      this.notification.error(
        this.translationService.translate('COMMON.ERROR'), 
        this.translationService.translate('TICKETS.ERROR_UPLOADING_SOME_FILES')
      );
      throw error;
    } finally {
      this.uploading.set(false);
    }
  }
}