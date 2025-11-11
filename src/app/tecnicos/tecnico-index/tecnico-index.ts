// src/app/tecnicos/tecnico-index/tecnico-index.ts
import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TecnicoService } from '../../share/services/api/tecnico.service';
import { UsuarioModel } from '../../share/models/UsuarioModel';
import { NotificationService } from '../../share/services/app/notification.service';
import { Disponibilidad } from '../../share/models/EnumsModel';

@Component({
  selector: 'app-tecnico-index',
  standalone: false,
  templateUrl: './tecnico-index.html',
  styleUrl: './tecnico-index.css',
})
export class TecnicoIndex implements OnInit {
  protected readonly tecnicos = signal<UsuarioModel[]>([]);
  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string>('');

  constructor(
    private tecnicoService: TecnicoService,
    private router: Router,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadTecnicos();
  }

  loadTecnicos(): void {
    this.loading.set(true);
    this.error.set('');

    this.tecnicoService.get().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.tecnicos.set(response.data.tecnicos);
          console.log('Técnicos cargados:', response.data.tecnicos);
        } else {
          this.error.set('Error en la respuesta del servidor');
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar técnicos:', error);
        this.error.set('Error al conectar con el servidor');
        this.loading.set(false);
        this.notification.error('Error', 'No se pudieron cargar los técnicos');
      }
    });
  }

  verDetalle(id: number): void {
    this.router.navigate(['/tecnicos', id]);
  }

  getDisponibilidadColor(disponibilidad: Disponibilidad): string {
    switch (disponibilidad) {
      case Disponibilidad.DISPONIBLE: return 'primary';
      case Disponibilidad.OCUPADO: return 'warn';
      case Disponibilidad.AUSENTE: return 'accent';
      default: return 'basic';
    }
  }

  getDisponibilidadIcon(disponibilidad: Disponibilidad): string {
    switch (disponibilidad) {
      case Disponibilidad.DISPONIBLE: return 'check_circle';
      case Disponibilidad.OCUPADO: return 'schedule';
      case Disponibilidad.AUSENTE: return 'cancel';
      default: return 'help';
    }
  }

  getDisponibilidadText(disponibilidad: Disponibilidad): string {
    switch (disponibilidad) {
      case Disponibilidad.DISPONIBLE: return 'Disponible';
      case Disponibilidad.OCUPADO: return 'Ocupado';
      case Disponibilidad.AUSENTE: return 'Ausente';
      default: return 'Desconocido';
    }
  }

  getCargaColor(cargaActual: number): string {
    if (cargaActual === 0) return 'success';
    if (cargaActual <= 3) return 'primary';
    if (cargaActual <= 5) return 'warn';
    return 'accent';
  }

  retry(): void {
    this.loadTecnicos();
  }
}