// src/app/categorias/categoria-form/categoria-form.ts
import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CategoriaService } from '../../share/services/api/categoria.service';
import { NotificationService } from '../../share/services/app/notification.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { EtiquetaModel } from '../../share/models/EtiquetaModel';
import { EspecialidadModel } from '../../share/models/EspecialidadModel';
import { PoliticaSlaModel } from '../../share/models/PoliticaSlaModel';
import { EspecialidadService } from '../../share/services/especialidad/especialidad.service';
import { TiqueteService as EtiquetaService } from '../../share/services/api/etiqueta.service';

@Component({
  selector: 'app-categoria-form',
  standalone: false,
  templateUrl: './categoria-form.html',
  styleUrl: './categoria-form.css',
})
export class CategoriaForm implements OnInit {
  categoriaForm!: FormGroup;
  categoriaId: number | null = null;
  isEditMode = false;
  
  protected readonly etiquetas = signal<EtiquetaModel[]>([]);
  protected readonly especialidades = signal<EspecialidadModel[]>([]);
  protected readonly slas = signal<PoliticaSlaModel[]>([]);
  protected readonly loading = signal<boolean>(false);
  protected readonly loadingData = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly slaSeleccionado = signal<PoliticaSlaModel | null>(null);
  protected readonly usarSlaPersonalizado = signal<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private categoriaService: CategoriaService,
    private especialidadService: EspecialidadService,
    private etiquetaService: EtiquetaService,
    private notification: NotificationService,
    private http: HttpClient
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.checkEditMode();
    this.loadInitialData();
  }

  private checkEditMode(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.categoriaId = parseInt(id);
        this.isEditMode = true;
      }
    });
  }

  private initForm(): void {
    this.categoriaForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      descripcion: ['', [Validators.maxLength(500)]],
      etiquetas: [[], [Validators.required, this.arrayMinLengthValidator(1)]],
      especialidades: [[], [Validators.required, this.arrayMinLengthValidator(1)]],
      // SLA: puede seleccionar uno existente o establecer tiempos manualmente
      idsla: [''],
      usarSlaPersonalizado: [false],
      maxminutosrespuesta: [null, [Validators.min(1)]],
      maxminutosresolucion: [null, [Validators.min(1)]]
    }, { validators: this.slaValidator });

    // Escuchar cambios en usarSlaPersonalizado
    this.categoriaForm.get('usarSlaPersonalizado')?.valueChanges.subscribe(usarPersonalizado => {
      this.usarSlaPersonalizado.set(usarPersonalizado);
      if (usarPersonalizado) {
        this.categoriaForm.get('idsla')?.setValue('');
        this.categoriaForm.get('maxminutosrespuesta')?.setValidators([Validators.required, Validators.min(1)]);
        this.categoriaForm.get('maxminutosresolucion')?.setValidators([Validators.required, Validators.min(1)]);
      } else {
        this.categoriaForm.get('maxminutosrespuesta')?.clearValidators();
        this.categoriaForm.get('maxminutosresolucion')?.clearValidators();
        this.categoriaForm.get('maxminutosrespuesta')?.setValue(null);
        this.categoriaForm.get('maxminutosresolucion')?.setValue(null);
      }
      this.categoriaForm.get('maxminutosrespuesta')?.updateValueAndValidity();
      this.categoriaForm.get('maxminutosresolucion')?.updateValueAndValidity();
    });

    // Escuchar cambios en idsla
    this.categoriaForm.get('idsla')?.valueChanges.subscribe(slaId => {
      if (slaId && !this.usarSlaPersonalizado()) {
        const sla = this.slas().find(s => s.id === parseInt(slaId));
        this.slaSeleccionado.set(sla || null);
      } else {
        this.slaSeleccionado.set(null);
      }
    });

    // Escuchar cambios en maxminutosrespuesta para validar maxminutosresolucion
    this.categoriaForm.get('maxminutosrespuesta')?.valueChanges.subscribe(() => {
      this.categoriaForm.get('maxminutosresolucion')?.updateValueAndValidity();
    });
  }

  private arrayMinLengthValidator(minLength: number) {
    return (control: any) => {
      const value = control.value;
      if (!value || !Array.isArray(value) || value.length < minLength) {
        return { arrayMinLength: { requiredLength: minLength, actualLength: value?.length || 0 } };
      }
      return null;
    };
  }

  private slaValidator(formGroup: FormGroup) {
    const usarPersonalizado = formGroup.get('usarSlaPersonalizado')?.value;
    const idsla = formGroup.get('idsla')?.value;
    const maxminutosrespuesta = formGroup.get('maxminutosrespuesta')?.value;
    const maxminutosresolucion = formGroup.get('maxminutosresolucion')?.value;

    if (!usarPersonalizado && !idsla) {
      return { slaRequired: true };
    }

    if (usarPersonalizado) {
      if (!maxminutosrespuesta || maxminutosrespuesta <= 0) {
        return { tiempoRespuestaRequired: true };
      }
      if (!maxminutosresolucion || maxminutosresolucion <= 0) {
        return { tiempoResolucionRequired: true };
      }
      if (maxminutosresolucion <= maxminutosrespuesta) {
        return { tiempoResolucionMayor: true };
      }
    }

    return null;
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
        // Si estamos en modo edición, cargar los datos de la categoría después de cargar los datos iniciales
        if (this.isEditMode && this.categoriaId) {
          this.loadCategoriaData();
        }
      }
    };

    // Cargar etiquetas usando el servicio de etiquetas (BaseAPI.get())
    this.etiquetaService.get().subscribe({
      next: (response) => {
        // El backend devuelve { success: true, data: { etiquetas: [...] } }
        if (Array.isArray(response)) {
          this.etiquetas.set(response);
        } else if ((response as any).success && (response as any).data?.etiquetas) {
          this.etiquetas.set((response as any).data.etiquetas);
        } else if ((response as any).data?.etiquetas) {
          this.etiquetas.set((response as any).data.etiquetas);
        } else {
          // Si viene como array directo desde BaseAPI
          this.etiquetas.set(response as EtiquetaModel[]);
        }
        checkAllLoaded();
      },
      error: (error) => {
        console.error('Error al cargar etiquetas:', error);
        this.notification.error('Error', 'No se pudieron cargar las etiquetas');
        checkAllLoaded();
      }
    });

    // Cargar especialidades usando el servicio de especialidades
    this.especialidadService.getAll().subscribe({
      next: (response) => {
        if (response.success && response.data.especialidades) {
          this.especialidades.set(response.data.especialidades);
        }
        checkAllLoaded();
      },
      error: (error) => {
        console.error('Error al cargar especialidades:', error);
        this.notification.error('Error', 'No se pudieron cargar las especialidades');
        checkAllLoaded();
      }
    });

    // Cargar SLAs directamente desde el endpoint de política SLA
    this.http.get<any>(`${environment.apiURL}/${environment.endPointPoliticaSla}`).subscribe({
      next: (response) => {
        // El backend devuelve { success: true, data: { slas: [...] } }
        // Ya vienen filtrados por activo: true desde el backend
        if ((response as any).success && (response as any).data?.slas) {
          this.slas.set((response as any).data.slas);
        } else if ((response as any).data?.slas) {
          this.slas.set((response as any).data.slas);
        } else if (Array.isArray(response)) {
          // Si viene como array directo
          this.slas.set(response.filter((sla: PoliticaSlaModel) => sla.activo));
        }
        checkAllLoaded();
      },
      error: (error) => {
        console.error('Error al cargar SLAs:', error);
        this.notification.error('Error', 'No se pudieron cargar los SLAs');
        checkAllLoaded();
      }
    });
  }

  private loadCategoriaData(): void {
    if (!this.categoriaId) return;

    this.loading.set(true);
    this.categoriaService.getById(this.categoriaId).subscribe({
      next: (response: any) => {
        if (response.success) {
          const categoria = response.data.categoria;
          
          // Cargar etiquetas seleccionadas
          const etiquetasIds = categoria.etiquetas?.map((e: any) => e.etiqueta?.id || e.id) || [];
          
          // Cargar especialidades seleccionadas
          const especialidadesIds = categoria.especialidades?.map((e: any) => e.especialidad?.id || e.id) || [];

          // Determinar si usar SLA personalizado o uno existente
          const tieneSlaPersonalizado = categoria.politicaSla?.nombre?.includes('Personalizado');
          
          this.categoriaForm.patchValue({
            nombre: categoria.nombre,
            descripcion: categoria.descripcion || '',
            etiquetas: etiquetasIds,
            especialidades: especialidadesIds,
            idsla: tieneSlaPersonalizado ? '' : categoria.idsla,
            usarSlaPersonalizado: tieneSlaPersonalizado,
            maxminutosrespuesta: tieneSlaPersonalizado ? categoria.politicaSla?.maxminutosrespuesta : null,
            maxminutosresolucion: tieneSlaPersonalizado ? categoria.politicaSla?.maxminutosresolucion : null
          });

          if (tieneSlaPersonalizado) {
            this.usarSlaPersonalizado.set(true);
          } else if (categoria.idsla) {
            const sla = this.slas().find(s => s.id === categoria.idsla);
            this.slaSeleccionado.set(sla || null);
          }
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar categoría:', error);
        this.notification.error('Error', 'No se pudo cargar la información de la categoría');
        this.loading.set(false);
      }
    });
  }

  onSlaChange(): void {
    const idsla = this.categoriaForm.get('idsla')?.value;
    if (idsla) {
      const sla = this.slas().find(s => s.id === parseInt(idsla));
      this.slaSeleccionado.set(sla || null);
    } else {
      this.slaSeleccionado.set(null);
    }
  }

  compareEtiquetas(e1: number, e2: number): boolean {
    return e1 === e2;
  }

  compareEspecialidades(e1: number, e2: number): boolean {
    return e1 === e2;
  }

  formatearTiempoSLA(minutos: number): string {
    if (minutos < 60) {
      return `${minutos} minutos`;
    }
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    if (mins === 0) {
      return `${horas} ${horas === 1 ? 'hora' : 'horas'}`;
    }
    return `${horas}h ${mins}m`;
  }

  onSubmit(): void {
    if (this.categoriaForm.invalid) {
      this.markFormGroupTouched(this.categoriaForm);
      this.notification.warning('Validación', 'Por favor complete todos los campos requeridos correctamente');
      return;
    }

    // Validación adicional de SLA
    const usarPersonalizado = this.categoriaForm.get('usarSlaPersonalizado')?.value;
    const idsla = this.categoriaForm.get('idsla')?.value;
    const maxminutosrespuesta = this.categoriaForm.get('maxminutosrespuesta')?.value;
    const maxminutosresolucion = this.categoriaForm.get('maxminutosresolucion')?.value;

    if (!usarPersonalizado && !idsla) {
      this.notification.warning('Validación', 'Debe seleccionar un SLA o establecer tiempos personalizados');
      return;
    }

    if (usarPersonalizado) {
      if (!maxminutosrespuesta || maxminutosrespuesta <= 0) {
        this.notification.warning('Validación', 'El tiempo de respuesta debe ser mayor a cero');
        return;
      }
      if (!maxminutosresolucion || maxminutosresolucion <= 0) {
        this.notification.warning('Validación', 'El tiempo de resolución debe ser mayor a cero');
        return;
      }
      if (maxminutosresolucion <= maxminutosrespuesta) {
        this.notification.warning('Validación', 'El tiempo de resolución debe ser mayor que el tiempo de respuesta');
        return;
      }
    }

    this.loading.set(true);
    this.error.set('');

    const formData: any = {
      nombre: this.categoriaForm.get('nombre')?.value.trim(),
      descripcion: this.categoriaForm.get('descripcion')?.value.trim() || '',
      etiquetas: this.categoriaForm.get('etiquetas')?.value,
      especialidades: this.categoriaForm.get('especialidades')?.value
    };

    if (usarPersonalizado) {
      formData.maxminutosrespuesta = parseInt(maxminutosrespuesta);
      formData.maxminutosresolucion = parseInt(maxminutosresolucion);
    } else {
      formData.idsla = parseInt(idsla);
    }

    const request = this.isEditMode && this.categoriaId
      ? this.http.put<any>(`${environment.apiURL}/${environment.endPointCategoria}/${this.categoriaId}`, formData)
      : this.http.post<any>(`${environment.apiURL}/${environment.endPointCategoria}`, formData);

    request.subscribe({
      next: (response: any) => {
        if (response.success) {
          this.notification.success('Éxito', this.isEditMode ? 'Categoría actualizada exitosamente' : 'Categoría creada exitosamente');
          setTimeout(() => {
            this.router.navigate(['/categorias']);
          }, 1000);
        } else {
          this.error.set('Error al guardar la categoría');
          this.loading.set(false);
        }
      },
      error: (error: any) => {
        console.error('Error al guardar categoría:', error);
        const errorMessage = error.error?.message || 'Error al guardar la categoría';
        this.error.set(errorMessage);
        this.loading.set(false);
        this.notification.error('Error', errorMessage);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/categorias']);
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
    const control = this.categoriaForm.get(fieldName);
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
    if (control?.hasError('min')) {
      return 'El valor debe ser mayor a cero';
    }
    if (control?.hasError('arrayMinLength')) {
      return 'Debe seleccionar al menos una opción';
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.categoriaForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getFormError(): string {
    const formErrors = this.categoriaForm.errors;
    if (formErrors?.['slaRequired']) {
      return 'Debe seleccionar un SLA o establecer tiempos personalizados';
    }
    if (formErrors?.['tiempoRespuestaRequired']) {
      return 'El tiempo de respuesta es requerido cuando se usa SLA personalizado';
    }
    if (formErrors?.['tiempoResolucionRequired']) {
      return 'El tiempo de resolución es requerido cuando se usa SLA personalizado';
    }
    if (formErrors?.['tiempoResolucionMayor']) {
      return 'El tiempo de resolución debe ser mayor que el tiempo de respuesta';
    }
    return '';
  }
}

