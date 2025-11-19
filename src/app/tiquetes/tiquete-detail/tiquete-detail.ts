// src/app/tiquetes/tiquete-detail/tiquete-detail.ts
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TiqueteService } from '../../share/services/api/tiquete.service';
import { TecnicoService } from '../../share/services/api/tecnico.service';
import { TiqueteModel } from '../../share/models/TiqueteModel';
import { UsuarioModel } from '../../share/models/UsuarioModel';
import { NotificationService } from '../../share/services/app/notification.service';
import { Prioridad, EstadoTiquete } from '../../share/models/EnumsModel';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tiqueteService: TiqueteService,
    private tecnicoService: TecnicoService,
    private notification: NotificationService,
    private http: HttpClient
  ) {}

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
            title: '¡Éxito!',
            text: 'Técnico asignado correctamente',
            showConfirmButton: false,
            timer: 1500
          });
        } else {
          // Si la respuesta no tiene el formato esperado, recargar desde el servidor
          this.loadTiqueteDetail(tiquete.id);
          this.editandoTecnico.set(false);
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Técnico asignado correctamente',
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
      case EstadoTiquete.ABIERTO: return 'abierto';
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
    if (!fecha) return 'No disponible';
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

  getCumplimientoIcon(cumplido: boolean | null): string {
    if (cumplido === null) return 'help';
    return cumplido ? 'check_circle' : 'cancel';
  }

  getCumplimientoColor(cumplido: boolean | null): string {
    if (cumplido === null) return 'neutral';
    return cumplido ? 'success' : 'error';
  }

  getCumplimientoTexto(cumplido: boolean | null): string {
    if (cumplido === null) return 'Pendiente';
    return cumplido ? 'Cumplido' : 'No Cumplido';
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
}