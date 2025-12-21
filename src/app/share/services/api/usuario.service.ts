import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseAPI } from './base-api';
import { UsuarioModel } from '../../models/UsuarioModel';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService extends BaseAPI<UsuarioModel> {

  constructor(httpClient: HttpClient) { 
    super(httpClient, environment.endPointUsuario);
  }

  // Solicitar restablecimiento de contraseña
  forgotPassword(correo: string): Observable<any> {
    return this.http.post<any>(`${environment.apiURL}/${environment.endPointUsuario}/forgot-password`, { correo });
  }

  // Restablecer contraseña con token fijo
  resetPassword(token: string, correo: string, password: string): Observable<any> {
    return this.http.post<any>(`${environment.apiURL}/${environment.endPointUsuario}/reset-password`, { token, correo, password });
  }

  // Buscar usuario por teléfono (para flujo de pedidos)
  buscarPorTelefono(telefono: string): Observable<any> {
    return this.http.get<any>(`${environment.apiURL}/${environment.endPointUsuario}/buscar-telefono/${telefono}`);
  }

  // Crear cliente temporal (sin contraseña, solo para pedidos)
  crearClienteTemporal(datos: any): Observable<any> {
    return this.http.post<any>(`${environment.apiURL}/${environment.endPointUsuario}/cliente-temporal`, datos);
  }

}

