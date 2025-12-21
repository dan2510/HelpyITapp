import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseAPI } from './base-api';
import { OrdenModel } from '../../models/OrdenModel';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class OrdenService extends BaseAPI<OrdenModel> {

  constructor(httpClient: HttpClient) { 
    super(httpClient, environment.endPointOrden);
  }

  // Obtener órdenes del usuario autenticado
  getMisOrdenes(): Observable<any> {
    return this.getMethod('mis-ordenes');
  }

  // Crear nueva orden (override del método base para usar el formato correcto)
  override create(data: any): Observable<any> {
    // Obtener cliente temporal de sessionStorage si existe
    const clienteTemporal = sessionStorage.getItem('clienteTemporal');
    if (clienteTemporal) {
      const cliente = JSON.parse(clienteTemporal);
      data.idcliente = cliente.id;
    }
    return this.http.post<any>(`${this.urlAPI}/${environment.endPointOrden}`, data);
  }

  // Buscar orden por número de pedido (público)
  buscarPorNumero(numeroPedido: string): Observable<any> {
    return this.http.get<any>(`${this.urlAPI}/${environment.endPointOrden}/buscar/${numeroPedido}`);
  }
}

