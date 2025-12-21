import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseAPI } from './base-api';
import { MenuItemModel } from '../../models/MenuItemModel';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class MenuService extends BaseAPI<MenuItemModel> {

  constructor(httpClient: HttpClient) { 
    super(httpClient, environment.endPointMenu);
  }

  // Obtener menú agrupado por categorías
  getMenuPorCategoria(): Observable<any> {
    return this.get();
  }

  // Sobrescribir get para manejar la respuesta del backend
  override get(): Observable<any> {
    return this.http.get<any>(`${this.urlAPI}/${environment.endPointMenu}`);
  }

  // Sobrescribir getById para manejar la respuesta del backend
  override getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.urlAPI}/${environment.endPointMenu}/${id}`);
  }

  // Sobrescribir create para manejar la respuesta del backend
  override create(item: any): Observable<any> {
    return this.http.post<any>(`${this.urlAPI}/${environment.endPointMenu}`, item);
  }

  // Sobrescribir update para manejar la respuesta del backend
  override update(item: any): Observable<any> {
    return this.http.put<any>(`${this.urlAPI}/${environment.endPointMenu}/${item.id}`, item);
  }

  // Sobrescribir delete para manejar la respuesta del backend
  override delete(item: any): Observable<any> {
    return this.http.delete<any>(`${this.urlAPI}/${environment.endPointMenu}/${item.id}`);
  }
}

