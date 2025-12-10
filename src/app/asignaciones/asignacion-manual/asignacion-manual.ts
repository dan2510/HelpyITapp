// src/app/asignaciones/asignacion-manual/asignacion-manual.ts
import { Component, OnInit, signal, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AsignacionService } from '../../share/services/api/asignacion.service';
import { AuthenticationService } from '../../share/services/app/authentication.service';
import { NotificationService } from '../../share/services/app/notification.service';
import { TranslationService } from '../../share/services/app/translation.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-asignacion-manual',
  standalone: false,
  templateUrl: './asignacion-manual.html',
  styleUrl: './asignacion-manual.css',
})
export class AsignacionManual implements OnInit {
  protected readonly loading = signal<boolean>(false);
  protected readonly loadingTecnicos = signal<boolean>(false);
  protected readonly tickets = signal<any[]>([]);
  protected readonly tecnicos = signal<any[]>([]);
  protected readonly error = signal<string>('');
  protected readonly ticketSeleccionado = signal<any>(null);
  protected readonly tecnicoSeleccionado = signal<any>(null);
  
  asignacionForm!: FormGroup;
  
  private asignacionService = inject(AsignacionService);
  private authService = inject(AuthenticationService);
  private notification = inject(NotificationService);
  protected readonly translationService = inject(TranslationService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    // Verificar que el usuario es ADMIN
    const usuario = this.authService.usuario();
    if (!usuario || usuario.rol?.nombre !== 'ADMIN') {
      this.router.navigate(['/tiquetes']);
      this.notification.error('Acceso denegado', 'Solo los administradores pueden acceder a esta funcionalidad');
      return;
    }

    this.initForm();
    this.loadTicketsPendientes();
  }

  initForm(): void {
    this.asignacionForm = this.fb.group({
      idTicket: [null, Validators.required],
      idTecnico: [null, Validators.required],
      justificacion: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  loadTicketsPendientes(): void {
    this.loading.set(true);
    this.error.set('');

    this.asignacionService.getTicketsPendientes().subscribe({
      next: (response: any) => {
        this.loading.set(false);
        if (response.success) {
          this.tickets.set(response.data.tickets || []);
        } else {
          this.error.set(response.message || 'Error al cargar tickets pendientes');
        }
      },
      error: (error: any) => {
        this.loading.set(false);
        const errorMessage = error.error?.message || 'Error al cargar tickets pendientes';
        this.error.set(errorMessage);
        this.notification.error('Error', errorMessage);
      }
    });
  }

  seleccionarTicket(ticket: any): void {
    this.ticketSeleccionado.set(ticket);
    this.asignacionForm.patchValue({ idTicket: ticket.id });
    this.loadTecnicosDisponibles(ticket.categoria.id);
  }

  loadTecnicosDisponibles(idCategoria?: number): void {
    this.loadingTecnicos.set(true);
    this.tecnicos.set([]);
    this.tecnicoSeleccionado.set(null);
    this.asignacionForm.patchValue({ idTecnico: null });

    this.asignacionService.getTecnicosDisponibles(idCategoria).subscribe({
      next: (response: any) => {
        this.loadingTecnicos.set(false);
        if (response.success) {
          // Filtrar solo técnicos con la especialidad requerida
          const ticket = this.ticketSeleccionado();
          if (ticket && ticket.especialidadesRequeridas && ticket.especialidadesRequeridas.length > 0) {
            const especialidadesRequeridasIds = ticket.especialidadesRequeridas.map((e: any) => e.id);
            const tecnicosFiltrados = response.data.tecnicos.filter((t: any) => 
              t.especialidades.some((esp: any) => especialidadesRequeridasIds.includes(esp.id))
            );
            this.tecnicos.set(tecnicosFiltrados);
          } else {
            this.tecnicos.set(response.data.tecnicos || []);
          }
        } else {
          this.notification.error('Error', response.message || 'Error al cargar técnicos');
        }
      },
      error: (error: any) => {
        this.loadingTecnicos.set(false);
        const errorMessage = error.error?.message || 'Error al cargar técnicos disponibles';
        this.notification.error('Error', errorMessage);
      }
    });
  }

  seleccionarTecnico(tecnico: any): void {
    this.tecnicoSeleccionado.set(tecnico);
    this.asignacionForm.patchValue({ idTecnico: tecnico.id });
  }

  asignarTicket(): void {
    if (this.asignacionForm.invalid) {
      this.markFormGroupTouched(this.asignacionForm);
      this.notification.warning('Validación', 'Por favor complete todos los campos requeridos');
      return;
    }

    const formValue = this.asignacionForm.value;
    
    Swal.fire({
      title: this.translationService.translate('ASSIGNMENTS.CONFIRM_ASSIGNMENT'),
      text: this.translationService.translate('ASSIGNMENTS.CONFIRM_ASSIGNMENT_TEXT'),
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: this.translationService.translate('COMMON.CONFIRM'),
      cancelButtonText: this.translationService.translate('COMMON.CANCEL'),
      confirmButtonColor: '#1976d2',
      cancelButtonColor: '#666'
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading.set(true);

        this.asignacionService.asignarManual(
          formValue.idTicket,
          formValue.idTecnico,
          formValue.justificacion
        ).subscribe({
          next: (response: any) => {
            this.loading.set(false);
            if (response.success) {
              Swal.fire({
                icon: 'success',
                title: this.translationService.translate('COMMON.SUCCESS'),
                text: response.message || this.translationService.translate('ASSIGNMENTS.ASSIGNMENT_SUCCESS'),
                showConfirmButton: true,
                confirmButtonText: this.translationService.translate('COMMON.OK')
              }).then(() => {
                // Limpiar formulario y recargar
                this.asignacionForm.reset();
                this.ticketSeleccionado.set(null);
                this.tecnicoSeleccionado.set(null);
                this.loadTicketsPendientes();
              });
            } else {
              this.notification.error('Error', response.message || 'Error al asignar ticket');
            }
          },
          error: (error: any) => {
            this.loading.set(false);
            const errorMessage = error.error?.message || 'Error al asignar ticket';
            this.notification.error('Error', errorMessage);
          }
        });
      }
    });
  }

  cancelar(): void {
    this.asignacionForm.reset();
    this.ticketSeleccionado.set(null);
    this.tecnicoSeleccionado.set(null);
    this.tecnicos.set([]);
  }

  formatearFecha(fecha: Date | string): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getPrioridadColor(prioridad: string): string {
    switch (prioridad?.toUpperCase()) {
      case 'CRITICA': return 'critica';
      case 'ALTA': return 'alta';
      case 'MEDIA': return 'media';
      case 'BAJA': return 'baja';
      default: return 'basic';
    }
  }

  getPrioridadNombre(prioridad: string): string {
    return this.translationService.translatePriority(prioridad);
  }

  getDisponibilidadColor(disponibilidad: string): string {
    switch (disponibilidad?.toUpperCase()) {
      case 'DISPONIBLE': return 'success';
      case 'OCUPADO': return 'warn';
      case 'AUSENTE': return 'error';
      default: return 'basic';
    }
  }

  getDisponibilidadNombre(disponibilidad: string): string {
    return this.translationService.translate('TECHNICIANS.AVAILABILITY.' + disponibilidad?.toUpperCase() || 'UNKNOWN');
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
}

