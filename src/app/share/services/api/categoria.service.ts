
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseAPI } from './base-api';
import { CategoriaModel } from '../../models/CategoriaModel';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class CategoriaService extends BaseAPI<CategoriaModel> {

    constructor(httpClient: HttpClient) { 
        super(
          httpClient,
          environment.endPointCategoriaMenu); 
      }

    // Sobrescribir el método get para manejar la respuesta del backend
    override get(): Observable<any> {
      const url = `${this.urlAPI}/${environment.endPointCategoriaMenu}`;
      console.log('📋 [CATEGORIA-SERVICE] GET URL:', url);
      return this.http.get<any>(url);
    }
}