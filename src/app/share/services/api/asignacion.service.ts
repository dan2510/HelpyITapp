import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { AsignacionTiquete } from '../../models/AsignacionTiqueteModel';

@Injectable({
  providedIn: 'root'
})
export class AsignacionService {
  private urlAPI: string = environment.apiURL;

  constructor(private http: HttpClient) { }

  // Obtener asignaciones por semana del técnico autenticado
  getAsignacionesPorSemana(
    fechaInicio?: string, 
    fechaFin?: string
  ): Observable<AsignacionTiquete> {
    let url = `${this.urlAPI}/asignaciones/mis-asignaciones/semana`;
    
    // Agregar parámetros de fecha si existen
    if (fechaInicio && fechaFin) {
      url += `?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
    }

    return this.http.get<AsignacionTiquete>(url);
  }
}