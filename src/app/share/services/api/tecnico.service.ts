import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UsuarioModel } from '../../models/UsuarioModel';
import { environment } from '../../../../environments/environment.development';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class TecnicoService {
  private urlAPI: string = environment.apiURL;
  private endpoint: string = environment.endPointTecnico;

  constructor(private httpClient: HttpClient) {}

  getAll(): Observable<ApiResponse<{ tecnicos: UsuarioModel[], total: number }>> {
    return this.httpClient.get<ApiResponse<{ tecnicos: UsuarioModel[], total: number }>>(
      `${this.urlAPI}/${this.endpoint}`
    );
  }

  getById(id: number): Observable<ApiResponse<{ tecnico: UsuarioModel }>> {
    return this.httpClient.get<ApiResponse<{ tecnico: UsuarioModel }>>(
      `${this.urlAPI}/${this.endpoint}/${id}`
    );
  }

  create(tecnico: any): Observable<ApiResponse<{ tecnico: UsuarioModel }>> {
    // Transformar password a contraseña y especialidades al formato correcto
    const tecnicoData = {
      ...tecnico,
      contraseña: tecnico.password || tecnico.contraseña,
      especialidades: this.formatEspecialidades(tecnico.especialidades)
    };
    delete tecnicoData.password; // Eliminar password si existe
    
    return this.httpClient.post<ApiResponse<{ tecnico: UsuarioModel }>>(
      `${this.urlAPI}/${this.endpoint}`,
      tecnicoData
    );
  }

  update(id: number, tecnico: any): Observable<ApiResponse<{ tecnico: UsuarioModel }>> {
    // Transformar especialidades al formato correcto
    const tecnicoData = {
      ...tecnico,
      especialidades: this.formatEspecialidades(tecnico.especialidades)
    };
    
    return this.httpClient.put<ApiResponse<{ tecnico: UsuarioModel }>>(
      `${this.urlAPI}/${this.endpoint}/${id}`,
      tecnicoData
    );
  }

  private formatEspecialidades(especialidades: any[]): any[] {
    if (!especialidades || especialidades.length === 0) {
      return [];
    }
    
    // Si son números, convertirlos a objetos
    return especialidades.map(esp => {
      if (typeof esp === 'number') {
        return { id: esp };
      }
      // Si ya es un objeto con idespecialidad, mantenerlo
      if (esp.idespecialidad) {
        return { id: esp.idespecialidad, nivelexperiencia: esp.nivelexperiencia };
      }
      // Si tiene id, mantenerlo
      if (esp.id) {
        return { id: esp.id, nivelexperiencia: esp.nivelexperiencia };
      }
      return esp;
    });
  }
}

