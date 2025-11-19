import { Component } from '@angular/core';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  // Contador de notificaciones para el badge
  notificationCount = 3; // Puedes conectar esto con un servicio real

  // URL del logo - el servidor sirve las imágenes desde /images que apunta a assets/uploads
  logoUrl = `${environment.apiURL}/images/helpyIT.jpg`;

  onLogoError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}