import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpRequest,
  HttpHandler,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../services/app/notification.service';


@Injectable({
  providedIn: 'root',
})

export class HttpErrorInterceptorService implements HttpInterceptor {
  //Recuerde que es necesario llamarlo como Proveedor
  //en AppModule
  constructor(private noti: NotificationService) {}
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    console.log('Request URL: ' + request.url);
    
    // Excluir peticiones a assets (archivos estáticos) del manejo de errores
    const isAssetRequest = request.url.includes('/assets/');
    
    // Excluir la búsqueda por teléfono del manejo de errores (el componente maneja el 404)
    const isBuscarTelefono = request.url.includes('/usuario/buscar-telefono/');
    
    //Capturar el error
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // No mostrar errores para peticiones a assets
        if (isAssetRequest) {
          throw new Error(error.message);
        }
        
        // No interceptar errores 404 o 401 de búsqueda por teléfono (es un caso esperado)
        // El 401 puede ocurrir si hay un token inválido, pero la ruta es pública
        if (isBuscarTelefono && (error.status === 404 || error.status === 401)) {
          // Re-lanzar el error original para que el componente lo maneje
          throw error;
        }
        
        let message: string | null = null;
        if (error.error instanceof ErrorEvent) {
          console.log('Error del Lado del Cliente');
          message = `Error: ${error.error.message}`;
        } else {
          console.log('Error del Lado del Servidor');
          message = `Código: ${error.status},  Mensaje: ${error.message}`;
          console.log(message);
          //Códigos de estado HTTP con su respectivo mensaje
          switch (error.status) {
            case 0:
              message="Error desconocido"
              break
            case 400:
              message = 'Solicitud incorrecta';
              break;
            case 401:
              message = 'No autorizado';
              break;
            case 403:
              message = 'Acceso denegado';
              break;
            case 404:
              message = 'Recurso No encontrado';
              break;
            case 422:
              message = 'Se ha presentado un error';
              break;
            case 500:
              message = 'Error interno del servidor';
              break;
            case 503:
              message = 'Servicio no disponible';
              break;
          }
        }
        this.noti.error('Error '+error.status,message,5000)
        throw new Error(error.message);
      })
    );
  }
}
