import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { Usuario } from '../../models/UsuarioModel';

export interface TecnicoListResponse {
  success: boolean;
  data: {
    tecnicos: TecnicoListItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TecnicoDetailResponse {
  success: boolean;
  data: {
    tecnico: TecnicoDetail;
  };
}

export interface TecnicoListItem {
  id: number;
  nombrecompleto: string;
  disponibilidad: string;
  cargaactual: number;
}

export interface TecnicoDetail extends Usuario {
  especialidades: any[];
  estadisticas: {
    ticketsTotal: number;
    ticketsResueltos: number;
    ticketsEnProgreso: number;
    porcentajeEfectividad: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TecnicoService {
  private apiUrl = environment.apiURL;

  constructor(private http: HttpClient) {}


  getTecnicos(): Observable<TecnicoListResponse> {
    return this.http.get<TecnicoListResponse>(`${this.apiUrl}/${environment.endPointTecnico}`);
  }

  getTecnicoById(id: number): Observable<TecnicoDetailResponse> {
    return this.http.get<TecnicoDetailResponse>(`${this.apiUrl}/${environment.endPointTecnico}/${id}`);
  }

  
  searchTecnicos(query: string): Observable<TecnicoListItem[]> {
    return this.http.get<TecnicoListItem[]>(`${this.apiUrl}/${environment.endPointTecnico}/search?q=${query}`);
  }
}