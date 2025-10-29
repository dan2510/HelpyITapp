import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TecnicoService, TecnicoListItem } from '../../share/services/api/tecnico.service';
import { NotificationService } from '../../share/services/app/notification.service';

@Component({
  selector: 'app-tecnico-index',
  standalone: false,
  templateUrl: './tecnico-index.html',
  styleUrl: './tecnico-index.css',
})
export class TecnicoIndex implements OnInit {
  tecnicos: TecnicoListItem[] = [];
  loading: boolean = false;
  error: string = '';

  constructor(
    private tecnicoService: TecnicoService,
    private router: Router,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadTecnicos();
  }

  loadTecnicos(): void {
    this.loading = true;
    this.error = '';

    this.tecnicoService.getTecnicos().subscribe({
      next: (response) => {
        if (response.success) {
          this.tecnicos = response.data.tecnicos;
        } else {
          this.error = 'Error al cargar técnicos';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.error = 'Error al conectar con el servidor';
        this.loading = false;
        this.notification.error('Error', 'No se pudieron cargar los técnicos');
      }
    });
  }

  verDetalle(id: number): void {
    this.router.navigate(['/tecnicos', id]);
  }

  getDisponibilidadColor(disponibilidad: string): string {
    switch (disponibilidad) {
      case 'DISPONIBLE':
        return 'success';
      case 'OCUPADO':
        return 'warn';
      case 'AUSENTE':
        return 'accent';
      default:
        return 'primary';
    }
  }
}