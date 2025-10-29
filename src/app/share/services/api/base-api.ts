import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.development';
export interface BaseEntity {
  id?: number;
}
@Injectable({
  providedIn: 'root',
})
export class BaseAPI<T extends BaseEntity> {
  /**
   * URL base del API, configurada en los archivos de entorno (environment.ts)
   * Ejemplo:
   *  environment.apiURL = 'http://localhost:3000'
   * 
   * URL final de ejemplo si el endpoint = 'productos':
   *    http://localhost:3000/productos
   */
  urlAPI: string = environment.apiURL;

  constructor(
    private http: HttpClient,
    /**
     * Nombre del endpoint o recurso (por ejemplo: 'productos', 'usuarios', 'ordenes')
     * Se inyecta al crear una instancia concreta del servicio.
     */
    @Inject(String) private endpoint: string
  ) { }
  /**
   * Obtiene la lista completa de elementos del recurso
   * Ejemplo final: GET http://localhost:3000/productos
   */
  get(): Observable<T[]> {
    return this.http.get<T[]>(`${this.urlAPI}/${this.endpoint}`);
  }
  /**
  * Permite ejecutar un método GET personalizado, útil para endpoints con acciones específicas
  * Ejemplo:
  *  getMethod('activos') → GET http://localhost:3000/productos/activos
  */
  getMethod(
    action: string,
    options: { [param: string]: unknown } = {}
  ): Observable<T | T[]> {
    return this.http.get<T[]>(
      `${this.urlAPI}/${this.endpoint}/${action}`,
      options
    );
  }
  /**
     * Obtiene un elemento por su ID
     * Ejemplo: GET http://localhost:3000/productos/5
     */
  getById(id: number): Observable<T> {
    return this.http.get<T>(`${this.urlAPI}/${this.endpoint}/${id}`);
  }
  /**
    * Crea un nuevo elemento
    * Ejemplo: POST http://localhost:3000/productos
    */
  create(item: T): Observable<T> {
    return this.http.post<T>(`${this.urlAPI}/${this.endpoint}`, item);
  }
  /**
     * Actualiza un elemento existente
     * Ejemplo: PUT http://localhost:3000/productos/5
     */
  update(item: T): Observable<T> {
    return this.http.put<T>(`${this.urlAPI}/${this.endpoint}/${item.id}`, item);
  }
  /**
    * Elimina un elemento existente
    * Ejemplo: DELETE http://localhost:3000/productos/5
    */
  delete(item: T) {
    return this.http.delete<T>(`${this.urlAPI}/${this.endpoint}/${item.id}`);
  }
}
