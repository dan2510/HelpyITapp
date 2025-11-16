import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseAPI } from './base-api';
import { EspecialidadModel } from '../../models/EspecialidadModel';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class TiqueteService extends BaseAPI<EspecialidadModel> {

  constructor(httpClient: HttpClient) { 
    super(httpClient, environment.endPointEtiqueta);
  }

 
}