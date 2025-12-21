import { Injectable } from '@angular/core'; 
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class HttpAuthInterceptorService implements HttpInterceptor {

  private tokenKey = 'currentUser';

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Rutas que NO requieren autenticación
    const publicRoutes = [
      '/usuario/login',
      '/usuario/register',
      '/usuario/buscar-telefono/',
      '/usuario/cliente-temporal',
      '/usuario/forgot-password',
      '/usuario/reset-password',
      '/menu',
      '/categorias-menu'
    ];

    // Verificar si la ruta es pública
    const isPublicRoute = publicRoutes.some(route => request.url.includes(route));

    // Solo agregar token si la ruta NO es pública
    if (!isPublicRoute) {
      const token = localStorage.getItem(this.tokenKey);
      if (token) {
        // Clona la solicitud y añade el encabezado de autorización
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    }

    return next.handle(request);
  }
}

