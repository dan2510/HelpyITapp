import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

  // ========== ASIGNACIÓN AUTOMÁTICA ==========
  
  /**
   * Ejecutar asignación automática de tickets pendientes
   */
  ejecutarAsignacionAutomatica(): Observable<any> {
    return this.http.post<any>(`${this.urlAPI}/asignaciones/automatica`, {});
  }

  // ========== ASIGNACIÓN MANUAL ==========

  /**
   * Obtener tickets pendientes para asignación manual
   */
  getTicketsPendientes(): Observable<any> {
    return this.http.get<any>(`${this.urlAPI}/asignaciones/manual/pendientes`);
  }

  /**
   * Obtener técnicos disponibles para asignación manual
   * @param idCategoria ID de la categoría para filtrar por especialidad (opcional)
   */
  getTecnicosDisponibles(idCategoria?: number): Observable<any> {
    let params = new HttpParams();
    if (idCategoria) {
      params = params.set('idCategoria', idCategoria.toString());
    }
    return this.http.get<any>(`${this.urlAPI}/asignaciones/manual/tecnicos`, { params });
  }

  /**
   * Realizar asignación manual de un ticket
   * @param idTicket ID del ticket a asignar
   * @param idTecnico ID del técnico a asignar
   * @param justificacion Justificación de la asignación (opcional)
   */
  asignarManual(idTicket: number, idTecnico: number, justificacion?: string): Observable<any> {
    return this.http.post<any>(`${this.urlAPI}/asignaciones/manual`, {
      idTicket,
      idTecnico,
      justificacion
    });
  }
}