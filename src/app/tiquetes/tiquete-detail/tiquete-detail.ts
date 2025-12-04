// src/app/tiquetes/tiquete-detail/tiquete-detail.ts
import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TiqueteService } from '../../share/services/api/tiquete.service';
import { TecnicoService } from '../../share/services/api/tecnico.service';
import { TiqueteModel } from '../../share/models/TiqueteModel';
import { UsuarioModel } from '../../share/models/UsuarioModel';
import { NotificationService } from '../../share/services/app/notification.service';
import { Prioridad, EstadoTiquete } from '../../share/models/EnumsModel';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { TranslationService } from '../../share/services/app/translation.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-tiquete-detail',
  standalone: false,
  templateUrl: './tiquete-detail.html',
  styleUrl: './tiquete-detail.css',
})
export class TiqueteDetail implements OnInit {
  protected readonly tiquete = signal<TiqueteModel | null>(null);
  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly tiqueteId = signal<number>(0);
  protected readonly tecnicos = signal<UsuarioModel[]>([]);
  protected readonly loadingTecnicos = signal<boolean>(false);
  protected readonly editandoTecnico = signal<boolean>(false);
  protected readonly tecnicoSeleccionado = signal<number | null>(null);

  // Formulario para actualizar estado
  estadoForm!: FormGroup;
  protected readonly archivosSeleccionados = signal<File[]>([]);
  protected readonly archivosSubidos = signal<string[]>([]);
  protected readonly uploading = signal<boolean>(false);
  protected readonly translationService = inject(TranslationService);
  private translate = inject(TranslateService);
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private tiqueteService: TiqueteService,
    private tecnicoService: TecnicoService,
    private notification: NotificationService,
    private http: HttpClient
  ) {
    this.initEstadoForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = parseInt(params['id']);
      if (id && !isNaN(id)) {
        this.tiqueteId.set(id);
        this.loadTiqueteDetail(id);
      } else {
        this.error.set('ID de tiquete inválido');
        this.notification.error('Error', 'ID de tiquete inválido');
      }
    });
  }

  loadTiqueteDetail(id: number): void {
    this.loading.set(true);
    this.error.set('');

    this.tiqueteService.getById(id).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.tiquete.set(response.data.tiquete);
          // Inicializar el técnico seleccionado con el técnico actual
          this.tecnicoSeleccionado.set(response.data.tiquete.tecnicoActual?.id || null);
          // Inicializar el formulario con los estados disponibles
          this.initEstadoForm();
          console.log('Detalle del tiquete cargado:', response.data.tiquete);
        } else {
          this.error.set('Error en la respuesta del servidor');
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar detalle del tiquete:', error);
        this.error.set('No se pudo cargar la información del tiquete');
        this.loading.set(false);
        this.notification.error('Error', 'No se pudo cargar la información del tiquete');
      }
    });
  }

  loadTecnicos(): void {
    this.loadingTecnicos.set(true);
    this.tecnicoService.get().subscribe({
      next: (response: any) => {
        // El backend devuelve { success: true, data: { tecnicos: [...] } }
        if (response.success && response.data && response.data.tecnicos) {
          this.tecnicos.set(response.data.tecnicos);
        } else if (Array.isArray(response)) {
          this.tecnicos.set(response);
        }
        this.loadingTecnicos.set(false);
      },
      error: (error) => {
        console.error('Error al cargar técnicos:', error);
        this.notification.error('Error', 'No se pudieron cargar los técnicos');
        this.loadingTecnicos.set(false);
      }
    });
  }

  iniciarEdicionTecnico(): void {
    this.editandoTecnico.set(true);
    if (this.tecnicos().length === 0) {
      this.loadTecnicos();
    }
  }

  cancelarEdicionTecnico(): void {
    this.editandoTecnico.set(false);
    // Restaurar el técnico original
    const tiquete = this.tiquete();
    this.tecnicoSeleccionado.set(tiquete?.tecnicoActual?.id || null);
  }

  guardarTecnico(): void {
    const idTecnico = this.tecnicoSeleccionado();
    const tiquete = this.tiquete();
    
    if (!tiquete) return;

    // Si no hay cambio, no hacer nada
    const tecnicoActualId = tiquete.tecnicoActual?.id || null;
    if (idTecnico === tecnicoActualId) {
      this.editandoTecnico.set(false);
      return;
    }

    this.loading.set(true);

    // Actualizar el ticket usando HttpClient directamente para manejar la respuesta del backend
    const updateData = {
      idtecnicoactual: idTecnico
    };

    this.http.put<any>(`${environment.apiURL}/${environment.endPointTiquete}/${tiquete.id}`, updateData).subscribe({
      next: (response: any) => {
        if (response.success && response.data && response.data.tiquete) {
          // Actualizar directamente con la respuesta del servidor
          this.tiquete.set(response.data.tiquete);
          this.tecnicoSeleccionado.set(response.data.tiquete.tecnicoActual?.id || null);
          this.editandoTecnico.set(false);
          this.loading.set(false);
          Swal.fire({
            icon: 'success',
            title: this.translationService.translate('COMMON.SUCCESS'),
            text: this.translationService.translate('TICKETS.TECHNICIAN_ASSIGNED'),
            showConfirmButton: false,
            timer: 1500
          });
        } else {
          // Si la respuesta no tiene el formato esperado, recargar desde el servidor
          this.loadTiqueteDetail(tiquete.id);
          this.editandoTecnico.set(false);
          Swal.fire({
            icon: 'success',
            title: this.translationService.translate('COMMON.SUCCESS'),
            text: this.translationService.translate('TICKETS.TECHNICIAN_ASSIGNED'),
            showConfirmButton: false,
            timer: 1500
          });
        }
      },
      error: (error: any) => {
        console.error('Error al actualizar técnico:', error);
        this.loading.set(false);
        const errorMessage = error.error?.message || 'Error al actualizar el técnico';
        this.notification.error('Error', errorMessage);
      }
    });
  }

  regresarAlListado(): void {
    this.router.navigate(['/tiquetes']);
  }

  retry(): void {
    if (this.tiqueteId() > 0) {
      this.loadTiqueteDetail(this.tiqueteId());
    }
  }

  // Métodos auxiliares
  getPrioridadColor(prioridad: Prioridad): string {
    switch (prioridad) {
      case Prioridad.BAJA: return 'baja';
      case Prioridad.MEDIA: return 'media';
      case Prioridad.ALTA: return 'alta';
      case Prioridad.CRITICA: return 'critica';
      default: return 'basic';
    }
  }

  getEstadoColor(estado: EstadoTiquete): string {
    switch (estado) {
      case EstadoTiquete.ASIGNADO: return 'asignado';
      case EstadoTiquete.EN_PROGRESO: return 'en-progreso';
      case EstadoTiquete.PENDIENTE: return 'pendiente';
      case EstadoTiquete.RESUELTO: return 'resuelto';
      case EstadoTiquete.CERRADO: return 'cerrado';
      case EstadoTiquete.CANCELADO: return 'cancelado';
      default: return 'basic';
    }
  }

  formatearFecha(fecha: Date | string | null | undefined): string {
    if (!fecha) {
      const currentLang = this.translate.currentLang || 'es';
      return currentLang === 'en' ? 'Not available' : 'No disponible';
    }
    const date = new Date(fecha);
    const currentLang = this.translate.currentLang || 'es';
    const locale = currentLang === 'en' ? 'en-US' : 'es-ES';
    return date.toLocaleDateString(locale, {
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
    const currentLang = this.translate.currentLang || 'es';
    const locale = currentLang === 'en' ? 'en-US' : 'es-ES';
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getCumplimientoIcon(cumplido: boolean | null): string {
    if (cumplido === null) return 'help';
    return cumplido ? 'check_circle' : 'cancel';
  }

  getCumplimientoColor(cumplido: boolean | null): string {
    if (cumplido === null) return 'neutral';
    return cumplido ? 'success' : 'error';
  }

  getCumplimientoTexto(cumplido: boolean | null): string {
    if (cumplido === null) return this.translationService.translate('TICKETS.COMPLIANCE_PENDING');
    return cumplido ? this.translationService.translate('TICKETS.COMPLIANCE_MET') : this.translationService.translate('TICKETS.COMPLIANCE_NOT_MET');
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

  getPrioridadIcon(prioridad: string): string {
    switch (prioridad.toLowerCase()) {
      case 'alta': return 'priority_high';
      case 'media': return 'warning';
      case 'baja': return 'low_priority';
      default: return 'help';
    }
  }

  /**
   * Obtiene la URL completa de una imagen basándose en el nombre del archivo
   * @param rutaArchivo Ruta o nombre del archivo
   * @returns URL completa para acceder a la imagen
   */
  getImageUrl(rutaArchivo: string): string {
    if (!rutaArchivo) return '';
    
    // Limpiar la ruta: remover "evidencias/" si está presente y extraer solo el nombre del archivo
    let nombreArchivo = rutaArchivo;
    
    // Si contiene "evidencias/", extraer solo el nombre del archivo
    if (nombreArchivo.includes('evidencias/')) {
      nombreArchivo = nombreArchivo.split('evidencias/').pop() || nombreArchivo;
    }
    
    // Si contiene "/", extraer solo el nombre del archivo
    if (nombreArchivo.includes('/')) {
      nombreArchivo = nombreArchivo.split('/').pop() || nombreArchivo;
    }
    
    // Construir la URL usando el endpoint de imágenes del servidor
    // El servidor sirve las imágenes desde /images que apunta a assets/uploads
    return `${environment.apiURL}/images/${nombreArchivo}`;
  }

  /**
   * Verifica si un archivo es una imagen basándose en su extensión
   * @param nombreArchivo Nombre del archivo
   * @returns true si es una imagen
   */
  esImagen(nombreArchivo: string): boolean {
    if (!nombreArchivo) return false;
    const extensionesImagen = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    const nombre = nombreArchivo.toLowerCase();
    return extensionesImagen.some(ext => nombre.endsWith(ext));
  }

  /**
   * Obtiene el nombre del archivo sin la ruta
   * @param rutaArchivo Ruta completa del archivo
   * @returns Nombre del archivo
   */
  getNombreArchivo(rutaArchivo: string): string {
    if (!rutaArchivo) return '';
    return rutaArchivo.split('/').pop() || rutaArchivo;
  }

  /**
   * Obtiene las imágenes relacionadas con el tiquete basándose en su título
   * Busca archivos en uploads que coincidan con el título del tiquete
   * @returns Array con nombres de archivos que podrían estar relacionados
   */
  getImagenesRelacionadas(): string[] {
    const tiquete = this.tiquete();
    if (!tiquete || !tiquete.titulo) return [];

    const titulo = tiquete.titulo;
    
    // Mapeo de títulos a nombres de archivo reales en uploads
    const mapeoTitulos: { [key: string]: string[] } = {
      'Sistema de facturación no responde': ['Sistema de facturación no responde.jpeg'],
      'Error en módulo de reportes': ['Error en módulo de reportes.png'],
      'Solicitud de acceso a carpeta compartida': ['Solicitud de acceso a carpeta compartida.png'],
      'Detección de actividad sospechosa en servidor': ['Deteccion de actividad sospechosa en servidor.jpg'],
      'Capacitación sobre nuevas herramientas de desarrollo': ['Capacitación sobre nuevas herramientas de desarrollo.png']
    };

    // Retornar el array de imágenes si existe el mapeo, sino intentar con extensiones comunes
    if (mapeoTitulos[titulo]) {
      return mapeoTitulos[titulo];
    }

    // Fallback: buscar con extensiones comunes
    const extensiones = ['.jpg', '.jpeg', '.png', '.gif'];
    return extensiones.map(ext => `${titulo}${ext}`);
  }

  /**
   * Verifica si existe una imagen relacionada con el tiquete
   * @param nombreArchivo Nombre del archivo a verificar
   * @returns true si la imagen debería existir
   */
  existeImagenRelacionada(nombreArchivo: string): boolean {
    // Por ahora retornamos true para los primeros 5 tiquetes
    // En producción, esto podría hacer una verificación real
    const tiquete = this.tiquete();
    if (!tiquete) return false;
    
    const primeros5Tiquetes = [
      'Sistema de facturación no responde',
      'Error en módulo de reportes',
      'Solicitud de acceso a carpeta compartida',
      'Detección de actividad sospechosa en servidor',
      'Capacitación sobre nuevas herramientas de desarrollo'
    ];

    return primeros5Tiquetes.includes(tiquete.titulo);
  }

  /**
   * Maneja errores al cargar imágenes
   * @param event Evento de error de la imagen
   */
  onImageError(event: any): void {
    console.warn('Error al cargar imagen:', event.target.src);
    // Ocultar la imagen si falla al cargar
    event.target.style.display = 'none';
    // Mostrar un placeholder
    const container = event.target.parentElement;
    if (container && !container.querySelector('.image-error-placeholder')) {
      const placeholder = document.createElement('div');
      placeholder.className = 'image-error-placeholder';
      placeholder.innerHTML = '<span class="error-icon">⚠️</span><span>Imagen no disponible</span>';
      container.appendChild(placeholder);
    }
  }

  /**
   * Maneja la carga exitosa de imágenes
   * @param event Evento de carga de la imagen
   */
  onImageLoad(event: any): void {
    // Asegurar que la imagen sea visible cuando se carga correctamente
    event.target.style.display = 'block';
    // Remover cualquier placeholder de error
    const container = event.target.parentElement;
    const placeholder = container?.querySelector('.image-error-placeholder');
    if (placeholder) {
      placeholder.remove();
    }
  }

  // ========== MÉTODOS PARA ACTUALIZAR ESTADO ==========

  initEstadoForm(): void {
    const tiquete = this.tiquete();
    const estadoActual = tiquete?.estado || EstadoTiquete.PENDIENTE;
    
    this.estadoForm = this.fb.group({
      nuevoEstado: [estadoActual, Validators.required], // Por defecto el estado actual
      observacion: ['', [Validators.required, Validators.minLength(10)]],
      tipoObservacion: ['INTERNAL', Validators.required] // Por defecto Internal
    });

  }

  cancelarActualizacionEstado(): void {
    this.estadoForm.reset();
    this.archivosSeleccionados.set([]);
    this.archivosSubidos.set([]);
    // Resetear el formulario con valores por defecto
    this.initEstadoForm();
  }

  getEstadosDisponibles(estadoActual: EstadoTiquete): EstadoTiquete[] {
    const flujo: { [key in EstadoTiquete]?: EstadoTiquete[] } = {
      [EstadoTiquete.PENDIENTE]: [EstadoTiquete.ASIGNADO],
      [EstadoTiquete.ASIGNADO]: [EstadoTiquete.EN_PROGRESO],
      [EstadoTiquete.EN_PROGRESO]: [EstadoTiquete.RESUELTO],
      [EstadoTiquete.RESUELTO]: [EstadoTiquete.CERRADO]
    };

    return flujo[estadoActual] || [];
  }

  getEstadoRetroceso(estadoActual: EstadoTiquete): EstadoTiquete | null {
    // No se permite retroceder estados, solo avanzar
    return null;
  }

  getTodosEstadosDisponibles(): { actual: EstadoTiquete; siguiente: EstadoTiquete | null; retroceso: EstadoTiquete | null } {
    const tiquete = this.tiquete();
    if (!tiquete) {
      return { actual: EstadoTiquete.PENDIENTE, siguiente: null, retroceso: null };
    }

    const estadoActual = tiquete.estado;
    const estadosAvance = this.getEstadosDisponibles(estadoActual);
    const estadoSiguiente = estadosAvance.length > 0 ? estadosAvance[0] : null;
    const estadoRetroceso = this.getEstadoRetroceso(estadoActual);

    return {
      actual: estadoActual,
      siguiente: estadoSiguiente,
      retroceso: estadoRetroceso
    };
  }

  puedeActualizarEstado(): boolean {
    const tiquete = this.tiquete();
    if (!tiquete) return false;

    // Se puede actualizar estado o agregar observación si no está cerrado
    return tiquete.estado !== EstadoTiquete.CERRADO && 
           tiquete.estado !== EstadoTiquete.CANCELADO;
  }

  async actualizarEstado(): Promise<void> {
    if (this.estadoForm.invalid) {
      this.markFormGroupTouched(this.estadoForm);
      this.notification.warning('Validación', 'Por favor complete todos los campos requeridos');
      return;
    }

    const tiquete = this.tiquete();
    if (!tiquete) return;

    const nuevoEstado = this.estadoForm.get('nuevoEstado')?.value;
    const estadoCambia = nuevoEstado !== tiquete.estado;

    // Validar que solo se puede avanzar al siguiente estado
    if (estadoCambia) {
      const estadosDisponibles = this.getEstadosDisponibles(tiquete.estado);
      if (!estadosDisponibles.includes(nuevoEstado)) {
        this.notification.warning('Validación', 'Solo se puede avanzar al siguiente estado en el flujo');
        return;
      }

      // Validar que hay al menos una imagen cuando se cambia el estado
      if (this.archivosSeleccionados().length === 0) {
        this.notification.warning('Validación', 'Se requiere al menos una imagen como evidencia al cambiar el estado');
        return;
      }

      // Validar que hay técnico asignado (excepto desde Pendiente)
      if (tiquete.estado !== EstadoTiquete.PENDIENTE && !tiquete.tecnicoActual) {
        this.notification.warning('Validación', 'No se puede avanzar el estado sin un técnico asignado');
        return;
      }
    }

    this.loading.set(true);
    this.uploading.set(true);

    try {
      // Subir archivos si hay (opcional cuando solo se agrega observación)
      let nombresArchivos: string[] = [];
      if (this.archivosSeleccionados().length > 0) {
        nombresArchivos = await this.subirArchivos();
      }

      // Actualizar estado u observación
      const observacion = this.estadoForm.get('observacion')?.value.trim();
      const tipoObservacion = this.estadoForm.get('tipoObservacion')?.value || 'INTERNAL';

      // Si no cambia el estado, solo agregar observación
      if (!estadoCambia) {
        // Llamar al endpoint de comentarios
        this.http.post<any>(
          `${environment.apiURL}/${environment.endPointTiquete}/${tiquete.id}/comentarios`,
          {
            tipo: tipoObservacion,
            contenido: observacion
          }
        ).subscribe({
          next: (response: any) => {
            if (response.success) {
              this.loading.set(false);
              this.uploading.set(false);
              Swal.fire({
                icon: 'success',
                title: this.translationService.translate('COMMON.SUCCESS'),
                text: this.translationService.translate('TICKETS.OBSERVATION_ADDED'),
                showConfirmButton: false,
                timer: 1500
              }).then(() => {
                this.loadTiqueteDetail(tiquete.id);
                this.cancelarActualizacionEstado();
              });
            } else {
              this.loading.set(false);
              this.uploading.set(false);
              this.notification.error('Error', response.message || 'Error al agregar la observación');
            }
          },
          error: (error: any) => {
            this.loading.set(false);
            this.uploading.set(false);
            const errorMessage = error.error?.message || 'Error al agregar la observación';
            this.notification.error('Error', errorMessage);
          }
        });
        return;
      }

      // Si cambia el estado, usar el endpoint de actualización de estado

      // Llamar directamente al endpoint usando HttpClient
      this.http.patch<any>(
        `${environment.apiURL}/${environment.endPointTiquete}/${tiquete.id}/estado`,
        {
          nuevoEstado,
          observacion,
          imagenes: nombresArchivos,
          tipoObservacion: tipoObservacion // EXTERNAL o INTERNAL
        }
      ).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.loading.set(false);
            this.uploading.set(false);
            Swal.fire({
              icon: 'success',
              title: this.translationService.translate('COMMON.SUCCESS'),
              text: this.translationService.translate('TICKETS.STATUS_UPDATED'),
              showConfirmButton: false,
              timer: 1500
            }).then(() => {
              // Recargar el detalle del ticket
              this.loadTiqueteDetail(tiquete.id);
              this.cancelarActualizacionEstado();
            });
          } else {
            this.loading.set(false);
            this.uploading.set(false);
            this.notification.error('Error', response.message || 'Error al actualizar el estado');
          }
        },
        error: (error: any) => {
          this.loading.set(false);
          this.uploading.set(false);
          const errorMessage = error.error?.message || 'Error al actualizar el estado del ticket';
          this.notification.error('Error', errorMessage);
        }
      });
    } catch (error: any) {
      this.loading.set(false);
      this.uploading.set(false);
      this.notification.error('Error', 'Error al subir los archivos');
    }
  }

  // Métodos para manejo de archivos (similar a tiquete-form)
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
    input.value = '';
  }

  removerArchivo(archivo: File): void {
    const archivos = this.archivosSeleccionados().filter(f => f !== archivo);
    this.archivosSeleccionados.set(archivos);
  }

  esImagenArchivo(nombreArchivo: string): boolean {
    const extension = nombreArchivo.toLowerCase().split('.').pop();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(extension || '');
  }

  getFilePreview(archivo: File): string {
    if (this.esImagenArchivo(archivo.name)) {
      return URL.createObjectURL(archivo);
    }
    return '';
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
    }
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

  getEstadoNombre(estado: EstadoTiquete | string): string {
    return this.translationService.translateTicketState(estado);
  }

  getPrioridadNombre(prioridad: Prioridad): string {
    return this.translationService.translatePriority(prioridad);
  }

  getEstadoIcon(estado: EstadoTiquete): string {
    switch (estado) {
      case EstadoTiquete.ASIGNADO: return 'assignment_ind';
      case EstadoTiquete.EN_PROGRESO: return 'hourglass_empty';
      case EstadoTiquete.PENDIENTE: return 'schedule';
      case EstadoTiquete.RESUELTO: return 'check_circle';
      case EstadoTiquete.CERRADO: return 'done_all';
      case EstadoTiquete.CANCELADO: return 'cancel';
      default: return 'help';
    }
  }

  // Método para obtener comentarios desde historiales
  getComentarios(): any[] {
    const tiquete = this.tiquete();
    if (!tiquete || !tiquete.historiales) {
      return [];
    }
    return tiquete.historiales.filter((hist: any) => 
      hist.tipo === 'COMENTARIO_EXTERNAL' || hist.tipo === 'COMENTARIO_INTERNAL'
    );
  }

}