// src/app/asignaciones/asignacion-automatica/asignacion-automatica.ts
import { Component, OnInit, signal, inject } from '@angular/core';
import { AsignacionService } from '../../share/services/api/asignacion.service';
import { AuthenticationService } from '../../share/services/app/authentication.service';
import { NotificationService } from '../../share/services/app/notification.service';
import { TranslationService } from '../../share/services/app/translation.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-asignacion-automatica',
  standalone: false,
  templateUrl: './asignacion-automatica.html',
  styleUrl: './asignacion-automatica.css',
})
export class AsignacionAutomatica implements OnInit {
  protected readonly loading = signal<boolean>(false);
  protected readonly ejecutando = signal<boolean>(false);
  protected readonly resultado = signal<any>(null);
  protected readonly error = signal<string>('');

  private asignacionService = inject(AsignacionService);
  private authService = inject(AuthenticationService);
  private notification = inject(NotificationService);
  protected readonly translationService = inject(TranslationService);
  private router = inject(Router);

  ngOnInit(): void {
    // Verificar que el usuario es ADMIN
    const usuario = this.authService.usuario();
    if (!usuario || usuario.rol?.nombre !== 'ADMIN') {
      this.router.navigate(['/tiquetes']);
      this.notification.error('Acceso denegado', 'Solo los administradores pueden acceder a esta funcionalidad');
    }
  }

  ejecutarAsignacionAutomatica(): void {
    this.ejecutando.set(true);
    this.error.set('');
    this.resultado.set(null);

    this.asignacionService.ejecutarAsignacionAutomatica().subscribe({
      next: (response: any) => {
        this.ejecutando.set(false);
        if (response.success) {
          this.resultado.set(response.data);
          
          Swal.fire({
            icon: 'success',
            title: this.translationService.translate('COMMON.SUCCESS'),
            html: `
              <p><strong>${response.message}</strong></p>
              <p>Asignados: ${response.data.asignados}</p>
              <p>No asignados: ${response.data.noAsignados}</p>
            `,
            showConfirmButton: true,
            confirmButtonText: this.translationService.translate('COMMON.OK')
          });
        } else {
          this.error.set(response.message || 'Error al ejecutar asignación automática');
          this.notification.error('Error', this.error());
        }
      },
      error: (error: any) => {
        this.ejecutando.set(false);
        const errorMessage = error.error?.message || 'Error al ejecutar asignación automática';
        this.error.set(errorMessage);
        this.notification.error('Error', errorMessage);
      }
    });
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
}

