import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TecnicoService } from '../../share/services/api/tecnico.service';
import { EspecialidadService } from '../../share/services/especialidad/especialidad.service';
import { EspecialidadModel } from '../../share/models/EspecialidadModel';
import { Disponibilidad, NivelExperiencia } from '../../share/models/EnumsModel';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tecnico-form',
  templateUrl: './tecnico-form.html',
  styleUrls: ['./tecnico-form.css'],
  standalone: false
})
export class TecnicoForm implements OnInit {
  private fb = inject(FormBuilder);
  private tecnicoService = inject(TecnicoService);
  private especialidadService = inject(EspecialidadService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  tecnicoForm!: FormGroup;
  especialidades: EspecialidadModel[] = [];
  isEditMode: boolean = false;
  tecnicoId: number | null = null;
  isLoading: boolean = false;
  
  // Mapa para almacenar niveles de experiencia por especialidad
  nivelesExperienciaMap: Map<number, NivelExperiencia> = new Map();

  // Opciones para los selects
  disponibilidadOptions = Object.values(Disponibilidad);
  nivelExperienciaOptions = Object.values(NivelExperiencia);

  ngOnInit(): void {
    this.initForm();
    this.loadEspecialidades();
    this.checkEditMode();
  }

  private initForm(): void {
    this.tecnicoForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      password: ['', []],
      nombrecompleto: ['', [Validators.required, Validators.minLength(3)]],
      telefono: ['', [Validators.pattern('^[0-9]{8,15}$')]],
      disponibilidad: [Disponibilidad.DISPONIBLE, Validators.required],
      maxticketsimultaneos: [5, [Validators.required, Validators.min(1), Validators.max(20)]],
      especialidades: [[], [Validators.required]],
      activo: [true],
      cargaactual: [{ value: 0, disabled: true }] // Campo de solo lectura
    });

    // Escuchar cambios en el campo 'activo' para actualizar disponibilidad automáticamente
    this.tecnicoForm.get('activo')?.valueChanges.subscribe(activo => {
      if (!activo) {
        // Si se marca como inactivo, cambiar disponibilidad a INACTIVO automáticamente
        this.tecnicoForm.patchValue({
          disponibilidad: Disponibilidad.INACTIVO
        }, { emitEvent: false }); // emitEvent: false para evitar bucles infinitos
      }
    });
  }

  private loadEspecialidades(): void {
    this.especialidadService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.especialidades = response.data.especialidades;
        }
      },
      error: (error) => {
        console.error('Error al cargar especialidades:', error);
        Swal.fire('Error', 'No se pudieron cargar las especialidades', 'error');
      }
    });
  }

  private checkEditMode(): void {
    this.route.params.subscribe(params => {
      // Verificar si estamos en modo edición (ruta /editar/:id)
      if (params['id'] && this.route.snapshot.url.some(segment => segment.path === 'editar')) {
        this.isEditMode = true;
        this.tecnicoId = +params['id'];
        this.loadTecnicoData();
        
        // En modo edición, la contraseña no es requerida
        this.tecnicoForm.get('password')?.clearValidators();
        this.tecnicoForm.get('password')?.updateValueAndValidity();
      } else {
        // En modo creación, la contraseña es requerida
        this.isEditMode = false;
        this.tecnicoId = null;
        this.tecnicoForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
        this.tecnicoForm.get('password')?.updateValueAndValidity();
      }
    });
  }

  private loadTecnicoData(): void {
    if (this.tecnicoId) {
      this.isLoading = true;
      this.tecnicoService.getById(this.tecnicoId).subscribe({
        next: (response) => {
          if (response.success) {
            const tecnico = response.data.tecnico;
            
            // Mapear las especialidades del técnico - solo IDs para el mat-select
            const especialidades = tecnico.especialidades ?? [];
            const especialidadesIds = especialidades.map(esp => esp.id);
            
            // Cargar niveles de experiencia en el mapa
            this.nivelesExperienciaMap.clear();
            especialidades.forEach(esp => {
              this.nivelesExperienciaMap.set(esp.id, esp.nivelexperiencia || NivelExperiencia.JUNIOR);
            });
            
            this.tecnicoForm.patchValue({
              correo: tecnico.correo,
              nombrecompleto: tecnico.nombrecompleto,
              telefono: tecnico.telefono,
              disponibilidad: tecnico.disponibilidad,
              maxticketsimultaneos: tecnico.maxticketsimultaneos,
              especialidades: especialidadesIds,
              activo: tecnico.activo,
              cargaactual: tecnico.cargaactual || 0
            });
            
            // Asegurar que cargaactual esté deshabilitado
            this.tecnicoForm.get('cargaactual')?.disable();
            
            // Deshabilitar el campo de correo en modo edición
            this.tecnicoForm.get('correo')?.disable();
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error al cargar técnico:', error);
          Swal.fire('Error', 'No se pudo cargar la información del técnico', 'error');
          this.isLoading = false;
          this.router.navigate(['/tecnicos']);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.tecnicoForm.invalid) {
      Object.keys(this.tecnicoForm.controls).forEach(key => {
        const control = this.tecnicoForm.get(key);
        if (control && control.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.isLoading = true;
    const formValue = this.tecnicoForm.getRawValue(); // getRawValue incluye campos deshabilitados
    
    // Obtener especialidades con su estructura correcta desde el mapa
    const especialidadesIds = formValue.especialidades || [];
    const especialidadesFormateadas = especialidadesIds.map((id: number) => ({
      id: id,
      idespecialidad: id,
      nivelexperiencia: this.nivelesExperienciaMap.get(id) || NivelExperiencia.JUNIOR
    }));
    
    // Preparar el objeto a enviar
    const tecnicoData = {
      ...formValue,
      especialidades: especialidadesFormateadas,
      // cargaactual NO se envía - se gestiona automáticamente en el backend
    };

    if (this.isEditMode && this.tecnicoId) {
      // Actualizar técnico
      this.tecnicoService.update(this.tecnicoId, tecnicoData).subscribe({
        next: (response) => {
          this.isLoading = false;
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Técnico actualizado correctamente',
            showConfirmButton: false,
            timer: 1500
          }).then(() => {
            this.router.navigate(['/tecnicos']);
          });
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error al actualizar técnico:', error);
          Swal.fire('Error', 'No se pudo actualizar el técnico', 'error');
        }
      });
    } else {
      // Crear nuevo técnico
      this.tecnicoService.create(tecnicoData).subscribe({
        next: (response) => {
          this.isLoading = false;
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Técnico creado correctamente',
            showConfirmButton: false,
            timer: 1500
          }).then(() => {
            this.router.navigate(['/tecnicos']);
          });
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error al crear técnico:', error);
          Swal.fire('Error', error.error.message || 'No se pudo crear el técnico', 'error');
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/tecnicos']);
  }

  // Helpers para el template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.tecnicoForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.tecnicoForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return 'Este campo es obligatorio';
      if (field.errors['email']) return 'Email inválido';
      if (field.errors['minlength']) return `Mínimo ${field.errors['minlength'].requiredLength} caracteres`;
      if (field.errors['pattern']) return 'Formato inválido';
      if (field.errors['min']) return `El valor mínimo es ${field.errors['min'].min}`;
      if (field.errors['max']) return `El valor máximo es ${field.errors['max'].max}`;
    }
    return '';
  }

  // Comparador para mat-select múltiple
  compareEspecialidades = (esp1: number, esp2: number): boolean => {
    return esp1 === esp2;
  }

  // Manejo de especialidades múltiples
  onEspecialidadChange(selectedIds: number[]): void {
    if (!selectedIds || selectedIds.length === 0) {
      this.nivelesExperienciaMap.clear();
      return;
    }
    
    // Limpiar niveles de especialidades que ya no están seleccionadas
    const idsActuales = Array.from(this.nivelesExperienciaMap.keys());
    idsActuales.forEach(id => {
      if (!selectedIds.includes(id)) {
        this.nivelesExperienciaMap.delete(id);
      }
    });
    
    // Inicializar niveles para nuevas especialidades
    selectedIds.forEach(id => {
      if (!this.nivelesExperienciaMap.has(id)) {
        this.nivelesExperienciaMap.set(id, NivelExperiencia.JUNIOR);
      }
    });
  }

  updateNivelExperiencia(especialidadId: number, nivel: NivelExperiencia): void {
    this.nivelesExperienciaMap.set(especialidadId, nivel);
  }

  getEspecialidadNombre(id: number): string {
    if (!id) return '';
    const esp = this.especialidades.find(e => e.id === id);
    return esp ? esp.nombre : '';
  }

  // Obtener IDs de especialidades seleccionadas
  getEspecialidadesIds(): number[] {
    const especialidades = this.tecnicoForm.get('especialidades')?.value || [];
    return especialidades.filter((id: any) => id !== undefined && id !== null);
  }

  // Obtener nivel de experiencia de una especialidad
  getNivelExperiencia(especialidadId: number): NivelExperiencia {
    return this.nivelesExperienciaMap.get(especialidadId) || NivelExperiencia.JUNIOR;
  }
}