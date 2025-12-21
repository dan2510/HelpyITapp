// src/app/categorias/categoria-form/categoria-form.ts
import { Component, OnInit, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CategoriaService } from '../../share/services/api/categoria.service';
import { NotificationService } from '../../share/services/app/notification.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { CategoriaModel } from '../../share/models/CategoriaModel';
import Swal from 'sweetalert2';

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
  
  protected readonly loading = signal<boolean>(false);
  protected readonly loadingData = signal<boolean>(false);
  protected readonly error = signal<string>('');

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private categoriaService: CategoriaService,
    // Servicios obsoletos comentados - no aplican para restaurante
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
      descripcion: ['', [Validators.maxLength(500)]]
    });
  }

 
  private loadInitialData(): void {
    this.loadingData.set(true);
    this.error.set('');

    let completedRequests = 0;
    const totalRequests = 0; // Temporal: etiquetas, especialidades y SLA no aplican para restaurante

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

    // Cargar etiquetas - COMENTADO: Etiquetas no aplican para categorías de menú
    // Las categorías de menú no necesitan etiquetas ni especialidades
    
    // Cargar SLAs - COMENTADO: No aplica para sistema de restaurante
    // Las categorías de menú no necesitan SLA
    
    // Marcar como cargado inmediatamente ya que no hay datos que cargar
    this.loadingData.set(false);
    if (this.isEditMode && this.categoriaId) {
      this.loadCategoriaData();
    }
  }

  private loadCategoriaData(): void {
    if (!this.categoriaId) return;

    this.loading.set(true);
    this.categoriaService.getById(this.categoriaId).subscribe({
      next: (response: any) => {
        if (response.success) {
          const categoria = response.data.categoria;
          
          this.categoriaForm.patchValue({
            nombre: categoria.nombre,
            descripcion: categoria.descripcion || ''
          });
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar categoría:', error);
        this.notification.error(
          'Error', 
          'Error al cargar la categoría'
        );
        this.loading.set(false);
      }
    });
  }


  onSubmit(): void {
    if (this.categoriaForm.invalid) {
      this.markFormGroupTouched(this.categoriaForm);
      this.notification.warning(
        'Advertencia', 
        'Por favor complete todos los campos requeridos'
      );
      return;
    }

    this.loading.set(true);
    this.error.set('');

    const categoriaData: any = {
      nombre: this.categoriaForm.get('nombre')?.value.trim(),
      descripcion: this.categoriaForm.get('descripcion')?.value.trim() || ''
    };

    if (this.isEditMode && this.categoriaId) {
      // Actualizar categoría existente
      categoriaData.id = this.categoriaId;
      this.categoriaService.update(categoriaData).subscribe({
        next: (response: any) => {
          // El backend puede devolver { success: true, data: { categoria: {...} } } o directamente el objeto
          if (response && (response.success || response.id)) {
            this.loading.set(false);
            Swal.fire({
              icon: 'success',
              title: 'Éxito',
              text: 'Categoría actualizada correctamente',
              showConfirmButton: false,
              timer: 1500
            }).then(() => {
              // Navegar a la ruta padre (listado) usando ruta relativa
              this.router.navigate(['..'], { relativeTo: this.route });
            });
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
          Swal.fire(
            'Error', 
            errorMessage, 
            'error'
          );
        }
      });
    } else {
      // Crear nueva categoría
      this.categoriaService.create(categoriaData).subscribe({
        next: (response: any) => {
          // El backend puede devolver { success: true, data: { categoria: {...} } } o directamente el objeto
          if (response && (response.success || response.id)) {
            this.loading.set(false);
            Swal.fire({
              icon: 'success',
              title: 'Éxito',
              text: 'Categoría creada correctamente',
              showConfirmButton: false,
              timer: 1500
            }).then(() => {
              // Navegar a la ruta padre (listado) usando ruta relativa
              this.router.navigate(['..'], { relativeTo: this.route });
            });
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
          Swal.fire(
            'Error', 
            errorMessage, 
            'error'
          );
        }
      });
    }
  }

  onCancel(): void {
    // Navegar a la ruta padre (listado) usando ruta relativa
    this.router.navigate(['..'], { relativeTo: this.route });
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
      return 'Este campo es obligatorio';
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
      return 'El valor mínimo no es válido';
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.categoriaForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

}

