import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseAPI } from './base-api';
import { TecnicoModel  } from '../../models/TecnicoModel';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class TecnicoService extends BaseAPI<TecnicoModel> {

    constructor(httpClient: HttpClient) { 
        super(
          httpClient,
          environment.endPointTecnico);
      }

      
}

