import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EspecialidadModel } from '../../models/EspecialidadModel';
import { environment } from '../../../../environments/environment.development';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class EspecialidadService {
  private urlAPI: string = environment.apiURL;
  private endpoint: string = environment.endPointEspecialidad;

  constructor(private httpClient: HttpClient) {}

  getAll(): Observable<ApiResponse<{ especialidades: EspecialidadModel[], total: number }>> {
    return this.httpClient.get<ApiResponse<{ especialidades: EspecialidadModel[], total: number }>>(
      `${this.urlAPI}/${this.endpoint}`
    );
  }

  getById(id: number): Observable<ApiResponse<{ especialidad: EspecialidadModel }>> {
    return this.httpClient.get<ApiResponse<{ especialidad: EspecialidadModel }>>(
      `${this.urlAPI}/${this.endpoint}/${id}`
    );
  }
}

