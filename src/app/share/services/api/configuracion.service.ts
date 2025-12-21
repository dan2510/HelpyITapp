import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

export interface ConfiguracionModel {
  id: number;
  clave: string;
  valor: string;
  valorParsed?: any;
  descripcion?: string;
  tipo: string;
  creadoen: Date;
  actualizadoen: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService {
  private urlAPI = environment.apiURL;

  constructor(private http: HttpClient) {}

  // Obtener todas las configuraciones
  get(): Observable<any> {
    return this.http.get<any>(`${this.urlAPI}/${environment.endPointConfiguracion}`);
  }

  // Obtener configuración por clave
  getByClave(clave: string): Observable<any> {
    return this.http.get<any>(`${this.urlAPI}/${environment.endPointConfiguracion}/${clave}`);
  }

  // Crear o actualizar configuración
  upsert(configuracion: { clave: string; valor: any; descripcion?: string; tipo?: string }): Observable<any> {
    return this.http.post<any>(`${this.urlAPI}/${environment.endPointConfiguracion}`, configuracion);
  }

  // Actualizar configuración
  update(clave: string, configuracion: { valor: any; descripcion?: string; tipo?: string }): Observable<any> {
    return this.http.put<any>(`${this.urlAPI}/${environment.endPointConfiguracion}/${clave}`, configuracion);
  }

  // Método helper para obtener el precio por kilómetro del servicio express
  getPrecioPorKilometro(): Observable<number> {
    return new Observable(observer => {
      this.getByClave('servicio_express_precio_km').subscribe({
        next: (response: any) => {
          if (response.success && response.data?.valorParsed !== undefined) {
            observer.next(Number(response.data.valorParsed));
          } else {
            // Valor por defecto si no existe la configuración
            observer.next(800);
          }
          observer.complete();
        },
        error: (err) => {
          console.error('Error al obtener precio por kilómetro:', err);
          // Valor por defecto en caso de error
          observer.next(800);
          observer.complete();
        }
      });
    });
  }
}

